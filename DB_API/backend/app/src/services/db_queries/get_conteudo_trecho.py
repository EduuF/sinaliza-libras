from typing import Optional
from backend.app.src.CRUD.trecho_CRUD import CRUDTrecho
from backend.app.src.schemas.trecho_schema import TrechoBase


def get_conteudo_trecho_by_id(trecho_id: str) -> Optional[TrechoBase]:
    """
    Obtém o conteúdo de um trecho (trecho_id único) de uma planilha.
    Converte o ID de string (do query parameter) para int.
    """
    try:
        # CONVERSÃO CRÍTICA: Converte o ID de entrada (str) para int
        trecho_id_int = int(trecho_id)

        # Inicializa o objeto CRUD
        CRUDTrecho_obj = CRUDTrecho()

        # Chama o método CRUD com o tipo correto (int)
        trecho_encontrado = CRUDTrecho_obj.get_one_by_id(trecho_id=trecho_id_int)

        # Extrai conteúdo
        conteudo = trecho_encontrado.conteudo

        return conteudo

    except ValueError:
        # Captura se o trecho_id não for um número válido (ex: 'abc')
        print(f"ERRO DE VALOR: O trecho_id '{trecho_id}' não é um inteiro válido.")
        return None
    except Exception as e:
        # Captura erros de I/O, arquivo, etc.
        print(f"ERRO GENÉRICO NO SERVIÇO: {e}")
        return None