from typing import Optional, Dict

from backend.app.src.CRUD.trecho_CRUD import CRUDTrecho
from backend.app.src.CRUD.site_CRUD import CRUDSite
from backend.app.src.schemas.trecho_schema import TrechoBase

from backend.app.src.CRUD.interpete_CRUD import CRUDInterprete


def registra_video(interprete_id: int, video_url: str, trecho_id: int) -> bool:
    """
    Obtém o conteúdo de um trecho (trecho_id único) de uma planilha.
    Converte o ID de string (do query parameter) para int.
    """
    try:

        # Registra a url do video no trecho
        # Registra o trecho_id no interprete


        # Inicializa o objeto CRUD
        CRUDTrecho_obj = CRUDTrecho()
        CRUDInterprete_obj = CRUDInterprete()

        # Registra a url do video com a tradução ao trecho
        _ = CRUDTrecho_obj.update_one_by_id(trecho_id, 'video_url', video_url)
        _ = CRUDTrecho_obj.update_one_by_id(trecho_id, 'interprete_id', interprete_id)

        # Obtém os trechos já traduzidos pelo interprete e adiciona o novo trecho a esta lista
        interprete_infos = CRUDInterprete_obj.get_one_by_id(interprete_id=interprete_id)
        trechos_ids = interprete_infos.trechos_ids

        if trecho_id not in trechos_ids:
            trechos_ids.append(trecho_id)

        print(f'trechos_ids: {trechos_ids}')
        # Atualiza a lista de trechos traduzidos pelo interprete
        _ = CRUDInterprete_obj.update_one_by_id(interprete_id=interprete_id, column_name='trechos_ids', new_value=trechos_ids)

        return True

    except ValueError:
        # Captura se o trecho_id não for um número válido (ex: 'abc')
        print(f"ERRO DE VALOR: O trecho_id '{trecho_id}' não é um inteiro válido.")
        return False
    except Exception as e:
        # Captura erros de I/O, arquivo, etc.
        print(f"ERRO GENÉRICO NO SERVIÇO: {e}")
        return False