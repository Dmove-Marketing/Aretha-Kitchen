import fs from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';

const sourceDir = '_html-originais';
const destImagesDir = path.join('src', 'assets', 'images');

// Garantir que os diretórios existam
[sourceDir, destImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper para slugificar o nome do arquivo da página
function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper para baixar um arquivo via HTTPS
function downloadFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    https.get(fileUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Erro HTTP ${response.statusCode} ao baixar ${fileUrl}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Helper para baixar HTML da página
function fetchHtml(pageUrl) {
  return new Promise((resolve, reject) => {
    https.get(pageUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Seguir redirecionamento simples
        fetchHtml(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Erro HTTP ${response.statusCode} ao obter HTML de ${pageUrl}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

// Execução principal
async function main() {
  const args = process.argv.slice(2);
  const urlArg = args.find(arg => arg.startsWith('--url='));

  if (!urlArg) {
    console.error('\n❌ Erro: Por favor, forneça a URL da página WordPress.');
    console.log('Exemplo: node extract-assets.mjs --url=https://eventos.multiplaeventos.com.br/debutantes-v1/\n');
    process.exit(1);
  }

  const pageUrl = urlArg.split('=')[1];
  console.log(`\n🔍 Acessando: ${pageUrl}...`);

  try {
    const html = await fetchHtml(pageUrl);
    
    // Extrair o slug da URL para salvar o arquivo HTML
    const parsedUrl = new URL(pageUrl);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const rawSlug = pathParts[pathParts.length - 1] || 'index';
    const slug = slugify(rawSlug);
    
    const htmlPath = path.join(sourceDir, `${slug}.html`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML original salvo em: ${htmlPath}`);

    // Encontrar todas as URLs de imagens no HTML
    // Procura por src="url" ou url('url') com extensões comuns
    const imgRegex = /(https?:\/\/[^\s"'()<>]+?\.(?:jpg|jpeg|png|webp|avif|gif)(?:\?[^\s"']*)?)/gi;
    const matches = html.match(imgRegex) || [];
    
    // Remover duplicatas e filtrar apenas imagens válidas
    const imageUrls = Array.from(new Set(matches)).filter(url => {
      // Ignorar ícones de bibliotecas ou trackers
      return !url.includes('sentry') && !url.includes('facebook.com');
    });

    console.log(`📸 Encontradas ${imageUrls.length} imagens únicas. Iniciando downloads...`);

    let downloadCount = 0;
    let failCount = 0;

    // Baixar as imagens em paralelo com controle simples
    const downloadPromises = imageUrls.map(async (imgUrl) => {
      try {
        const cleanUrl = imgUrl.split('?')[0]; // Remover query params
        const filename = path.basename(cleanUrl);
        const destPath = path.join(destImagesDir, filename);

        // Se já existe localmente, pula o download
        if (fs.existsSync(destPath)) {
          downloadCount++;
          return;
        }

        await downloadFile(imgUrl, destPath);
        downloadCount++;
        console.log(`   📥 [${downloadCount}/${imageUrls.length}] Baixada: ${filename}`);
      } catch (err) {
        failCount++;
        console.warn(`   ⚠️ Erro ao baixar imagem: ${imgUrl} - ${err.message}`);
      }
    });

    await Promise.all(downloadPromises);

    console.log(`\n🎉 Processo de extração concluído!`);
    console.log(`   - HTML salvo em: _html-originais/${slug}.html`);
    console.log(`   - Imagens baixadas em: src/assets/images/ (${downloadCount} sucesso, ${failCount} falhas)\n`);
    console.log(`👉 Agora você pode rodar o scaffold:`);
    console.log(`   npm run scaffold\n`);

  } catch (err) {
    console.error(`\n❌ Erro geral no processo: ${err.message}\n`);
    process.exit(1);
  }
}

main();
