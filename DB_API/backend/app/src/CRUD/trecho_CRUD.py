"""CRUD operations for managing interprete in the database."""

from typing import List, Optional, Any
import pandas as pd
import gspread
import os
from gspread.exceptions import APIError, SpreadsheetNotFound

from backend.app.settings import SETTINGS_VAR
from backend.app.src.schemas.trecho_schema import TrechoBase


class CRUDTrecho:
    def __init__(self) -> None:
        """Inicializa a conexão com o Google Sheets API."""

        self.worksheet = None  # Inicializa para garantir que self.worksheet existe

        # Variáveis de Configuração
        try:
            # Garante que as variáveis são lidas de forma segura, usando 'None' como fallback
            credentials_path = str(getattr(SETTINGS_VAR, 'sheets_credentials_file', None))
            sheet_url = str(getattr(SETTINGS_VAR, 'planilha_trecho_url', None))
            worksheet_name = str(getattr(SETTINGS_VAR, 'planilha_trecho_tab_name', None))

            # --- VERIFICAÇÃO ROBUSTA DE CAMINHOS E CONFIGURAÇÃO ---
            if not credentials_path or credentials_path.lower() == 'none':
                raise AttributeError("sheets_credentials_file não está configurado ou está vazio/None em SETTINGS_VAR.")

            if not sheet_url or sheet_url.lower() == 'none':
                raise AttributeError("planilha_trecho_url não está configurado em SETTINGS_VAR.")

            if not worksheet_name or worksheet_name.lower() == 'none':
                raise AttributeError("planilha_trecho_tab_name não está configurado em SETTINGS_VAR.")

            # Checa se o arquivo de credenciais existe no caminho fornecido
            if not os.path.exists(credentials_path):
                # Imprime a localização atual do script para ajudar no debug do caminho
                current_dir = os.getcwd()
                raise FileNotFoundError(
                    f"Arquivo de credenciais não encontrado no caminho: {credentials_path}. "
                    f"Diretório de trabalho atual: {current_dir}. "
                    "Tente corrigir o caminho RELATIVO no seu .env (ex: credentials/google_sheets_credentials.json)."
                )

            # Autenticação com a Conta de Serviço
            gc = gspread.service_account(filename=credentials_path)

            # Abrir a Planilha pelo URL
            spreadsheet = gc.open_by_url(sheet_url)

            # Selecionar a Aba (Worksheet)
            self.worksheet = spreadsheet.worksheet(worksheet_name)

            print(f"INFO: Conectado com sucesso à planilha '{worksheet_name}'.")

        except AttributeError as e:
            # Captura erros de configuração (variável ausente/vazia)
            print(f"ERRO DE CONFIGURAÇÃO: {e}")
            self.worksheet = None
        except FileNotFoundError as e:
            # Captura o erro de caminho do arquivo JSON
            print(f"ERRO DE ARQUIVO: {e}")
            self.worksheet = None
        except SpreadsheetNotFound:
            # Captura se o URL da planilha estiver incorreto ou a planilha tiver sido deletada
            print(f"ERRO DE CONEXÃO: Planilha do Google não encontrada no URL: {sheet_url}")
            self.worksheet = None
        except APIError as e:
            # Captura erros de permissão ou outros erros da API do Google.
            print("-" * 60)
            print("ERRO DE CONEXÃO/AUTENTICAÇÃO COM GOOGLE SHEETS (APIError):")
            print("Causa mais comum: A planilha NÃO está compartilhada com o e-mail da Conta de Serviço.")
            print(f"Detalhe da API: {e}")
            print("-" * 60)
            self.worksheet = None
        except Exception as e:
            print(f"ERRO DESCONHECIDO DURANTE CONEXÃO GOOGLE SHEETS: {e}")
            self.worksheet = None

    def _get_dataframe(self) -> Optional[pd.DataFrame]:
        """
        Método auxiliar para ler a planilha e retornar um DataFrame.
        Usado para operações que se beneficiam da indexação do Pandas.
        """
        if not self.worksheet:
            return None

        try:
            # Obter todos os dados como lista de listas
            data = self.worksheet.get_all_records()
            # Criar DataFrame
            df = pd.DataFrame(data)

            # Garantir que trecho_id é int para comparação
            if 'trecho_id' in df.columns:
                # Usa pd.to_numeric de forma mais robusta e eficiente
                df['trecho_id'] = pd.to_numeric(df['trecho_id'], errors='coerce').fillna(-1).astype(int)

            return df
        except Exception as e:
            print(f"Erro ao ler dados da planilha e criar DataFrame: {e}")
            return None

    def get_one_by_id(self, trecho_id: int) -> Optional[TrechoBase]:
        """Obtém o conteúdo de um trecho (trecho_id único) da planilha."""
        df = self._get_dataframe()
        if df is None:
            return None

        try:
            # 1. Filtragem da Linha: Comparação de int com int
            linha_filtrada = df[df['trecho_id'] == trecho_id]

            # 2. Verificação de Existência
            if linha_filtrada.empty:
                return None

            # 3. Conversão para Dicionário e Criação do Modelo Pydantic
            trecho_dict = linha_filtrada.iloc[0].to_dict()

            # Cria o modelo Pydantic
            return TrechoBase(**trecho_dict)

        except ValueError:
            return None
        except Exception as e:
            print(f"Erro ao buscar trecho por ID: {e}")
            return None

    def delete_one_by_id(self, trecho_id: int) -> None:
        """
        Deleta um trecho (linha) pelo ID de forma PERSISTENTE no Google Sheets.
        """
        df = self._get_dataframe()
        if df is None or not self.worksheet:
            print(f"ERRO: Não foi possível conectar à planilha para deletar o ID {trecho_id}.")
            return

        try:
            # 1. Encontrar o Índice da Linha no DataFrame
            index_a_deletar = df[df['trecho_id'] == trecho_id].index

            if index_a_deletar.empty:
                print(f"AVISO: Trecho com ID {trecho_id} não encontrado para deleção.")
                return

            # O índice real na planilha do Google Sheets é 1-based,
            # e precisa compensar a linha de cabeçalho do Sheets (+2)
            # Ex: A primeira linha de dados (df.index[0]) é a linha 2 no Sheets.
            sheet_row_index = index_a_deletar[0] + 2

            # 2. Executar a Deleção Persistente usando gspread
            self.worksheet.delete_rows(sheet_row_index)

            print("-" * 50)
            print(f"SUCESSO: Trecho com ID {trecho_id} deletado permanentemente da planilha (Linha {sheet_row_index}).")
            print("-" * 50)

        except Exception as e:
            print(f"Erro ao tentar deletar trecho por ID {trecho_id}: {e}")
            return

    def get_all(self, site_id: int = None) -> Optional[List[TrechoBase]]:
        """Obtém todos os trechos da planilha."""
        df = self._get_dataframe()
        if df is None:
            return None

        try:
            # Se a flag para filtrar um site especifico estiver ativa, filtra
            if site_id:
                df = df[df['site_id'] == site_id]

            # Converte o DataFrame inteiro para uma lista de dicionários
            trechos_list_dicts = df.to_dict('records')

            #ETAPA DE CORREÇÃO: Limpeza In-Place (Modifica a lista original)
            for d in trechos_list_dicts:
                for key, value in d.items():
                    # Verifica se o valor é a string vazia problemática
                    if value == '':
                        # Substitui '' por None
                        d[key] = None

            # Mapeia a lista de dicionários para uma lista de modelos Pydantic
            trechos_base_list = [TrechoBase(**d) for d in trechos_list_dicts]

            return trechos_base_list
        except Exception as e:
            print(f"Erro ao obter todos os trechos: {e}")
            return None

    def update_one_by_id(self, trecho_id: int, column_name: str, new_value: Any) -> bool:
        """
        Atualiza o valor de uma coluna específica para um trecho (linha) usando o trecho_id.

        Args:
            trecho_id (int): O ID único do trecho a ser atualizado.
            column_name (str): O nome da coluna (cabeçalho) a ser modificada.
            new_value (any): O novo valor a ser inserido na célula.

        Returns:
            bool: True se a atualização for bem-sucedida, False caso contrário.
        """
        df = self._get_dataframe()
        if df is None or not self.worksheet:
            print(f"ERRO: Não foi possível conectar à planilha para atualizar o ID {trecho_id}.")
            return False

        try:
            # 1. Validar o Nome da Coluna
            # Garante que a coluna existe no DataFrame (e, portanto, na planilha)
            if column_name not in df.columns:
                print(f"ERRO: Coluna '{column_name}' não encontrada na planilha.")
                return False

            # 2. Encontrar a Linha no DataFrame
            index_a_atualizar = df[df['trecho_id'] == trecho_id].index

            if index_a_atualizar.empty:
                print(f"AVISO: Trecho com ID {trecho_id} não encontrado para atualização.")
                return False

            # 3. Determinar o Índice da Linha e Coluna no Google Sheets

            # Índice da Linha no Sheets (1-based, +2 para compensar o cabeçalho)
            sheet_row_index = index_a_atualizar[0] + 2

            # Encontra o índice da coluna no Sheets (1-based).
            # O get_all_records() garante que os headers do df são os headers do sheets.
            # O +1 é porque os índices de coluna em gspread são 1-based.
            sheet_col_index = df.columns.get_loc(column_name) + 1

            # 4. Executar a Atualização Persistente usando gspread
            # O gspread.update_cell espera o valor como string (ou número), não 'any'
            # Garantimos que None seja convertido para string vazia para limpar a célula,
            # e todos os outros valores são convertidos para str para compatibilidade com gspread
            value_to_write = str(new_value) if new_value is not None else ""

            self.worksheet.update_cell(sheet_row_index, sheet_col_index, value_to_write)

            print("-" * 50)
            print(
                f"SUCESSO: Trecho ID {trecho_id}: Coluna '{column_name}' atualizada para '{value_to_write}' (Linha {sheet_row_index}, Coluna {sheet_col_index}).")
            print("-" * 50)

            return True

        except Exception as e:
            print(f"Erro ao tentar atualizar trecho por ID {trecho_id}: {e}")
            return False