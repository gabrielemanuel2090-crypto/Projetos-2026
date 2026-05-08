/**
 * 🤖 RESUMIDOR IA FLASK - JavaScript Frontend
 * Chama API Python via fetch()
 */

class ResumidorFrontend {
    constructor() {
        this.init();
    }

    init() {
        this.inputText = document.getElementById('inputText');
        this.summarizeBtn = document.getElementById('summarizeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.outputSection = document.getElementById('outputSection');
        this.summaryContent = document.getElementById('summaryContent');
        this.wordCount = document.getElementById('wordCount');
        this.summaryWordCount = document.getElementById('summaryWordCount');
        this.reductionPercent = document.getElementById('reductionPercent');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.btnText = document.getElementById('btnText');
        this.themeIcon = document.getElementById('themeIcon');

        // Events
        this.summarizeBtn.addEventListener('click', () => this.resumir());
        this.clearBtn.addEventListener('click', () => this.limpar());
        this.copyBtn.addEventListener('click', () => this.copiar());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.inputText.addEventListener('input', () => this.atualizarContador());
        this.themeIcon.addEventListener('click', () => this.toggleTheme());

        this.atualizarContador();
    }

    async resumir() {
        const texto = this.inputText.value.trim();
        if (texto.length < 100) {
            alert('Texto muito curto!');
            return;
        }

        this.mostrarLoading(true);
        
        try {
            const response = await fetch('/api/resumir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto })
            });

            const data = await response.json();

            if (data.sucesso) {
                this.mostrarResumo(data.resumo, data.palavras_original, data.palavras_resumo, data.reducao);
            } else {
                alert(data.erro);
            }
        } catch (error) {
            alert('Erro de conexão: ' + error.message);
        }

        this.mostrarLoading(false);
    }

    mostrarResumo(resumo, orig, resumoPalavras, reducao) {
        this.summaryContent.textContent = resumo;
        this.outputSection.style.display = 'block';
        this.outputSection.scrollIntoView({ behavior: 'smooth' });

        this.summaryWordCount.textContent = `${resumoPalavras} palavras`;
        this.reductionPercent.textContent = `${reducao} menor`;
    }

    mostrarLoading(ativo) {
        this.loadingSpinner.classList.toggle('active', ativo);
        this.btnText.textContent = ativo ? 'Processando...' : 'Resumir com IA';
        this.summarizeBtn.disabled = ativo;
    }

    limpar() {
        this.inputText.value = '';
        this.outputSection.style.display = 'none';
        this.atualizarContador();
    }

    async copiar() {
        await navigator.clipboard.writeText(this.summaryContent.textContent);
        this.animarBotao(this.copyBtn, 'Copiado! ✅');
    }

    download() {
        const resumo = this.summaryContent.textContent;
        const nome = `resumo-ia-${new Date().toISOString().slice(0,10)}.txt`;
        const blob = new Blob([resumo], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nome;
        a.click();
        this.animarBotao(this.downloadBtn, 'Baixado! 📥');
    }

    atualizarContador() {
        const palavras = this.inputText.value.trim().match(/\b\w+\b/g)?.length || 0;
        this.wordCount.textContent = `${palavras} palavras`;
    }

    animarBotao(btn, texto) {
        const original = btn.innerHTML;
        btn.innerHTML = texto;
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.transform = '';
        }, 1500);
    }

    toggleTheme() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        this.themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

document.addEventListener('DOMContentLoaded', () => new ResumidorFrontend());