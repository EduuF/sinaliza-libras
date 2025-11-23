from typing import Optional, Dict

from backend.app.src.CRUD.trecho_CRUD import CRUDTrecho
from backend.app.src.CRUD.site_CRUD import CRUDSite
from backend.app.src.schemas.trecho_schema import TrechoBase


def get_trecho_para_traduzir(site_id: int = None) -> Optional[Dict[str, str]]:
    """
    Obtém o conteúdo de um trecho (trecho_id único) de uma planilha.
    Converte o ID de string (do query parameter) para int.
    """
    try:
        # Inicializa o objeto CRUD
        CRUDTrecho_obj = CRUDTrecho()
        CRUDSite_obj = CRUDSite()

        # Chama o método CRUD com o tipo correto (int)
        trechos_encontrados = CRUDTrecho_obj.get_all(site_id=site_id)
        print(f'trechos_encontrados: {trechos_encontrados}')

        # Seleciona o primeiro trecho sem tradução ainda
        trecho_selecionado = None
        for trecho in trechos_encontrados:
            if not trecho.interprete_id:
                trecho_selecionado = trecho
                break

        # Extrai conteúdo
        try:
            conteudo = trecho_selecionado.conteudo
            snapshot_name = trecho_selecionado.snapshot_name
            trecho_id = trecho_selecionado.trecho_id
        except:
            return

        # Pega a url do site do trecho
        site_infos = CRUDSite_obj.get_one_by_id(trecho_selecionado.site_id)
        print(f'site_infos: {site_infos}')
        site_url = site_infos.site_url

        return {'trecho_id': trecho_id, "conteudo": conteudo, "site_url": site_url, "snapshot_name": snapshot_name}

    except ValueError:
        # Captura se o trecho_id não for um número válido (ex: 'abc')
        print(f"ERRO DE VALOR: O site_id '{site_id}' não é um inteiro válido.")
        return None
    except Exception as e:
        # Captura erros de I/O, arquivo, etc.
        print(f"ERRO GENÉRICO NO SERVIÇO: {e}")
        return None