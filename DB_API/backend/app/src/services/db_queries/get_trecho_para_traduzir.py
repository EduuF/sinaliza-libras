from typing import Optional, Dict, List

from backend.app.src.CRUD.trecho_CRUD import CRUDTrecho
from backend.app.src.CRUD.site_CRUD import CRUDSite
from backend.app.src.schemas.trecho_schema import TrechoBase


def get_trecho_para_traduzir(site_id: int = None, get_all_trechos_from_site: bool = False) -> Optional[List[Dict[str, str]]]:
    """
    Obtém o conteúdo de um trecho (trecho_id único) de uma planilha.
    Converte o ID de string (do query parameter) para int.
    """
    try:
        # Inicializa o objeto CRUD
        CRUDTrecho_obj = CRUDTrecho()
        CRUDSite_obj = CRUDSite()

        # Chama o mét odo CRUD com o tipo correto (int)
        trechos_encontrados = CRUDTrecho_obj.get_all(site_id=site_id)
        print(f'trechos_encontrados: {trechos_encontrados}')

        # Seleciona o primeiro trecho sem tradução ainda
        trechos_selecionados = []
        for trecho in trechos_encontrados:
            if not trecho.interprete_id:
                # Extrai conteúdo
                try:
                    trecho_dict = {"conteudo": trecho.conteudo, "snapshot_name": trecho.snapshot_name, "trecho_id": trecho.trecho_id}
                except:
                    continue

                # Pega a url do site do trecho
                site_infos = CRUDSite_obj.get_one_by_id(trecho.site_id)
                print(f'site_infos: {site_infos}')
                trecho_dict['site_url'] = site_infos.site_url
                trecho_dict['site_id'] = site_infos.site_id

                trechos_selecionados.append(trecho_dict)

                # Se for para buscar apenas 1 trecho não busca outros, se for para buscar o site t odo, continua
                if not get_all_trechos_from_site:
                    break

        return trechos_selecionados

    except ValueError:
        # Captura se o trecho_id não for um número válido (ex: 'abc')
        print(f"ERRO DE VALOR: O site_id '{site_id}' não é um inteiro válido.")
        return None
    except Exception as e:
        # Captura erros de I/O, arquivo, etc.
        print(f"ERRO GENÉRICO NO SERVIÇO: {e}")
        return None