"""CRUD operations for managing interprete in the database."""

from typing import List, Optional
import pandas as pd
import gspread
import os
from gspread.exceptions import APIError, SpreadsheetNotFound
import ast

from backend.app.settings import SETTINGS_VAR
from backend.app.src.schemas.site_schema import SiteBase


class CRUDSite:
    def __init__(self) -> None:
        """Inicializa a conexão com o Google Sheets API."""

        self.worksheet = None  # Inicializa para garantir que self.worksheet existe

        # Variáveis de Configuração
        try:
            # Garante que as variáveis são lidas de forma segura, usando 'None' como fallback
            credentials_path = str(getattr(SETTINGS_VAR, 'sheets_credentials_file', None))
            sheet_url = str(getattr(SETTINGS_VAR, 'planilha_site_url', None))
            worksheet_name = str(getattr(SETTINGS_VAR, 'planilha_site_tab_name', None))

            # --- VERIFICAÇÃO ROBUSTA DE CAMINHOS E CONFIGURAÇÃO ---
            if not credentials_path or credentials_path.lower() == 'none':
                raise AttributeError("sheets_credentials_file não está configurado ou está vazio/None em SETTINGS_VAR.")

            if not sheet_url or sheet_url.lower() == 'none':
                raise AttributeError("planilha_site_url não está configurado em SETTINGS_VAR.")

            if not worksheet_name or worksheet_name.lower() == 'none':
                raise AttributeError("planilha_site_tab_name não está configurado em SETTINGS_VAR.")

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

            # Garantir que site_id é int para comparação
            if 'site_id' in df.columns:
                # Usa pd.to_numeric de forma mais robusta e eficiente
                df['site_id'] = pd.to_numeric(df['site_id'], errors='coerce').fillna(-1).astype(int)

            df['trechos_ids'] = df['trechos_ids'].apply(ast.literal_eval)

            return df
        except Exception as e:
            print(f"Erro ao ler dados da planilha e criar DataFrame: {e}")
            return None

    def get_one_by_id(self, site_id: int) -> Optional[SiteBase]:
        """Obtém o conteúdo de um site (site_id único) da planilha."""
        df = self._get_dataframe()
        if df is None:
            return None

        try:

            # 1. Filtragem da Linha: Comparação de int com int
            linha_filtrada = df[df['site_id'] == site_id]
            print(f'linha_filtrada: {linha_filtrada}')

            # 2. Verificação de Existência
            if linha_filtrada.empty:
                return None

            # 3. Conversão para Dicionário e Criação do Modelo Pydantic
            site_dict = linha_filtrada.iloc[0].to_dict()
            print(f'site_dict: {site_dict}')

            # Cria o modelo Pydantic
            return SiteBase(**site_dict)

        except ValueError:
            return None
        except Exception as e:
            print(f"Erro ao buscar site por ID: {e}")
            return None

    def delete_one_by_id(self, site_id: int) -> None:
        """
        Deleta um site (linha) pelo ID de forma PERSISTENTE no Google Sheets.
        """
        df = self._get_dataframe()
        if df is None or not self.worksheet:
            print(f"ERRO: Não foi possível conectar à planilha para deletar o ID {site_id}.")
            return

        try:
            # 1. Encontrar o Índice da Linha no DataFrame
            index_a_deletar = df[df['site_id'] == site_id].index

            if index_a_deletar.empty:
                print(f"AVISO: site com ID {site_id} não encontrado para deleção.")
                return

            # O índice real na planilha do Google Sheets é 1-based,
            # e precisa compensar a linha de cabeçalho do Sheets (+2)
            # Ex: A primeira linha de dados (df.index[0]) é a linha 2 no Sheets.
            sheet_row_index = index_a_deletar[0] + 2

            # 2. Executar a Deleção Persistente usando gspread
            self.worksheet.delete_rows(sheet_row_index)

            print("-" * 50)
            print(f"SUCESSO: site com ID {site_id} deletado permanentemente da planilha (Linha {sheet_row_index}).")
            print("-" * 50)

        except Exception as e:
            print(f"Erro ao tentar deletar site por ID {site_id}: {e}")
            return

    def get_all(self) -> Optional[List[SiteBase]]:
        """Obtém todos os sites da planilha."""
        df = self._get_dataframe()
        if df is None:
            return None

        try:
            # Converte o DataFrame inteiro para uma lista de dicionários
            sites_list_dicts = df.to_dict('records')

            # ETAPA DE CORREÇÃO: Limpeza In-Place (Modifica a lista original)
            for d in sites_list_dicts:
                for key, value in d.items():
                    # Verifica se o valor é a string vazia problemática
                    if value == '':
                        # Substitui '' por None
                        d[key] = None

            # Mapeia a lista de dicionários para uma lista de modelos Pydantic
            sites_base_list = [SiteBase(**d) for d in sites_list_dicts]

            return sites_base_list
        except Exception as e:
            print(f"Erro ao obter todos os sites: {e}")
            return None