import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import asyncio
import nest_asyncio
from playwright.async_api import async_playwright, BrowserContext
from PIL import Image, ImageDraw
import io
import os
import sys

# Aplica o nest_asyncio para permitir a execução de asyncio.run em ambientes como notebooks,
# embora em um script CLI puro isso não seja estritamente necessário, é mantido por robustez.
nest_asyncio.apply()

def extract_text_fragments(url: str) -> List[str]:
    """
    Recebe uma URL, baixa o conteúdo da página e retorna uma lista de fragmentos de texto
    apenas das tags <p> (parágrafo).

    Args:
        url (str): O endereço URL da página web a ser analisada.

    Returns:
        List[str]: Uma lista contendo fragmentos de texto limpo da página.
                   Retorna uma lista vazia em caso de erro.
    """
    # A função original foi simplificada para extrair apenas <p> para corresponder
    # ao comportamento da função `extract_and_highlight_fragments` (Playwright).
    TEXT_TAGS = ['p'] 
    fragments = []

    # 1. Tenta baixar o conteúdo da página
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

    except requests.exceptions.RequestException as e:
        print(f"Erro ao acessar a URL {url}: {e}")
        return []

    # 2. Analisa o HTML usando BeautifulSoup
    try:
        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove elementos não visíveis ou estruturais
        for script_or_style in soup(['script', 'style', 'footer', 'nav', 'form', 'aside', 'sup']):
            script_or_style.decompose()

        # 3. Itera sobre as tags de texto e extrai o conteúdo
        for tag_name in TEXT_TAGS:
            for element in soup.find_all(tag_name):
                # Usa .get_text(separator=' ', strip=True) para obter o texto limpo
                text = element.get_text(separator=' ', strip=True)

                if text:
                    fragments.append(text)

    except Exception as e:
        print(f"Erro durante a análise do HTML: {e}")
        return []

    return fragments

# ---

async def extract_and_highlight_fragments(url: str, output_dir: str = "highlighted_fragments_combined", crop_padding_x: int = 400, crop_padding_y: int = 400) -> List[Dict]:
    """
    Navega para a URL fornecida usando Playwright, tira um screenshot completo da página,
    identifica elementos <p>, cria e salva imagens recortadas com o fragmento destacado.

    Args:
        url (str): A URL da página web.
        output_dir (str): Diretório para salvar as imagens com os fragmentos destacados.
        crop_padding_x (int): Preenchimento horizontal (em pixels) ao redor do fragmento no recorte.
        crop_padding_y (int): Preenchimento vertical (em pixels) ao redor do fragmento no recorte.

    Returns:
        List[Dict]: Uma lista de dicionários com 'text', 'bounding_box' e 'image_path'.
    """
    os.makedirs(output_dir, exist_ok=True)
    fragments_data = []

    async with async_playwright() as p:
        browser = None
        page = None
        try:
            # Garante que o modo headless seja True para scripts de linha de comando
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            print(f"Buscando elementos e capturando screenshot de: {url}...")
            # wait_until="networkidle" aguarda que as requisições de rede diminuam (útil para SPAs)
            await page.goto(url, wait_until="networkidle") 

            # Tira um único screenshot de página inteira
            full_screenshot_bytes = await page.screenshot(full_page=True)
            original_full_screenshot = Image.open(io.BytesIO(full_screenshot_bytes))

            # Encontra todos os elementos <p>
            p_elements = await page.locator('p').all()

            print(f"Processando {len(p_elements)} parágrafos...")
            for i, element in enumerate(p_elements):
                text_content = await element.text_content()
                bounding_box = await element.bounding_box()

                if text_content is not None:
                    text_content = text_content.strip()

                # Verifica se há texto e se o elemento é visível/tem dimensões válidas
                if text_content and bounding_box and bounding_box['width'] > 0 and bounding_box['height'] > 0:
                    x, y, width, height = (
                        bounding_box['x'],
                        bounding_box['y'],
                        bounding_box['width'],
                        bounding_box['height']
                    )

                    # Calcula as coordenadas de recorte com preenchimento
                    crop_left = max(0, int(x - crop_padding_x))
                    crop_top = max(0, int(y - crop_padding_y))
                    crop_right = min(original_full_screenshot.width, int(x + width + crop_padding_x))
                    crop_bottom = min(original_full_screenshot.height, int(y + height + crop_padding_y))

                    # Recorta a imagem
                    cropped_image_to_highlight = original_full_screenshot.crop((crop_left, crop_top, crop_right, crop_bottom))
                    draw = ImageDraw.Draw(cropped_image_to_highlight)

                    # Ajusta as coordenadas do bounding box para serem relativas ao recorte
                    relative_x = x - crop_left
                    relative_y = y - crop_top

                    # Desenha o retângulo de destaque
                    draw.rectangle([relative_x, relative_y, relative_x + width, relative_y + height], outline='red', width=5)

                    # Salva a imagem destacada
                    image_filename = f"highlighted_fragment_{i+1}.png"
                    image_path = os.path.join(output_dir, image_filename)
                    cropped_image_to_highlight.save(image_path)

                    # Salva o conteúdo do texto em um arquivo .txt
                    text_filename = f"highlighted_fragment_{i+1}.txt"
                    text_path = os.path.join(output_dir, text_filename)
                    with open(text_path, 'w', encoding='utf-8') as f:
                        f.write(text_content)

                    fragments_data.append({
                        'text': text_content,
                        'bounding_box': {'x': x, 'y': y, 'width': width, 'height': height},
                        'image_path': image_path,
                        'text_path': text_path
                    })
                # else:
                #     print(f"  [SKIP] Fragmento {i+1} sem texto ou dimensões inválidas.") # Linha removida para simplificar o output

        except Exception as e:
            print(f"\nErro ao processar a URL {url} com Playwright: {e}")
        finally:
            if page:
                await page.close()
            if browser:
                await browser.close()

    return fragments_data

# --- Lógica principal ---
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python web_fragment_extractor.py <URL>")
        sys.exit(1)

    target_url = sys.argv[1]
    output_directory = "highlighted_fragments_combined"

    print(f"--- Iniciando Extração e Destaque de Fragmentos ---")
    print(f"URL Alvo: {target_url}")
    print(f"Diretório de Saída: {output_directory}\n")

    # 1. Extração rápida de texto com Requests/BeautifulSoup
    text_fragments_bs4 = extract_text_fragments(target_url)

    if text_fragments_bs4:
        print("## Fragmentos de Texto (Extração Rápida com BeautifulSoup)")
        for i, fragment in enumerate(text_fragments_bs4[:5]): # Limita a exibição dos 5 primeiros
            print(f"[{i + 1}] {fragment[:100]}...") # Exibe apenas os 100 primeiros caracteres
        print(f"Total de fragmentos encontrados (BS4): {len(text_fragments_bs4)}\n---")
    else:
        print("Nenhum fragmento de texto significativo encontrado com BeautifulSoup.")
        print("---")

    # 2. Extração visual com Playwright (Geração de Imagens)
    print("## Geração de Imagens Destacadas (Playwright)")
    # Chama a função assíncrona
    combined_fragments_data = asyncio.run(extract_and_highlight_fragments(target_url, output_dir=output_directory))

    if combined_fragments_data:
        print(f"\n✅ Sucesso! Total de {len(combined_fragments_data)} fragmentos processados.")
        print(f"As imagens destacadas e arquivos de texto foram salvas no diretório: **{output_directory}**")
        print("Você pode inspecionar os arquivos gerados.")
    else:
        print("\n❌ Falha na geração de imagens. Verifique a URL e a estrutura da página.")