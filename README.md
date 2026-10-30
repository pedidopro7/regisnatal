# Regis Motta — Um Natal para sentir

Landing page imersiva de Regis Motta — Decorações Natalinas.
Site estático (HTML, CSS e JS), sem build e sem dependências externas em tempo de execução: GSAP, ScrollTrigger, Lenis e as fontes já vêm dentro de `assets/`.

## Rodar localmente
```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar (Vercel)
Importe o repositório → Framework: **Other** → sem comando de build → diretório de saída: raiz (`.`).

## Configurar contatos
Edite `assets/js/config.js`:
```js
window.REGIS_CONFIG = {
  whatsapp: '5511999999999',              // DDI + DDD + número
  instagram: 'https://instagram.com/perfil'
};
```
- Com WhatsApp preenchido, o formulário mostra **“Enviar pelo WhatsApp”** com a mensagem já montada.
- Enquanto vazio, o formulário só gera um resumo copiável — **nada é enviado**.

## Experiência
- Abertura com contador e cortina
- Hero com foto em arco, luzes piscando, partículas douradas que reagem ao cursor, selo giratório, interruptor de luzes e som de sinos (“Noite Feliz”, domínio público, sintetizado)
- Rolagem suave (Lenis), cursor normal com rastro sutil de brilho dourado no hero, botões magnéticos e barra de progresso
- Títulos revelados linha a linha; texto que “acende” palavra por palavra
- Portfólio editorial com 12 projetos (árvores, guirlandas, detalhes e áreas externas), revelação das imagens, parallax, filtros e galeria em tela cheia (teclado e gesto de deslizar)
- “Um Natal em cada tom”: 10 estilos de árvore em rolagem horizontal fixa (desktop) e carrossel com deslize (celular)
- Logotipo do Regis no cabeçalho, no rodapé e como favicon
- Interlúdio fixo: a foto se expande de um arco até a tela inteira
- Serviços em acordeão com imagem que troca a cada serviço
- Contador animado dos 23 anos, assinatura desenhada, linha do processo que se desenha na rolagem
- Respeita `prefers-reduced-motion` e funciona sem JavaScript

## Estrutura
```
index.html
assets/css/style.css
assets/js/app.js        interações e animações
assets/js/config.js     contatos
assets/js/vendor/       gsap, ScrollTrigger, lenis
assets/fonts/           Cormorant Garamond + Manrope (woff2)
assets/img/             fotos reais em WebP + og.jpg
docs/CONTEXTO_ORIGINAL.md
```

## Pendências antes de entregar ao cliente
- Informar o WhatsApp real em `config.js` (Instagram já configurado como @regisdecoracao, visto no print enviado pelo cliente — confirmar)
- Confirmar os 23 anos de experiência, a área de atendimento e os direitos de uso das fotos
