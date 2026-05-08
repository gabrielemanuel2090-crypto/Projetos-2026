#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RESUMIDOR IA 
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import re
import os
from datetime import datetime

app = Flask(__name__)

class ResumidorIA:
    """ Algoritmo IA para resumos"""
    
    @staticmethod
    def contar_palavras(texto):
        """Conta palavras"""
        return len(re.findall(r'\b\w+\b', texto))
    
    @staticmethod
    def gerar_resumo(texto):
        """✨ Gera resumo inteligente em Python"""
        # Limpa texto
        texto = re.sub(r'\s+', ' ', texto.strip())
        frases = re.split(r'[.!?]+', texto)
        frases = [f.strip() for f in frases if len(f.strip()) > 10]
        
        if not frases:
            return "Texto muito curto para resumir."
        
        # Remove duplicatas
        frases_unicas = []
        vistos = set()
        for frase in frases:
            hash_frase = ' '.join(frase.lower().split()[:5])
            if hash_frase not in vistos:
                frases_unicas.append(frase)
                vistos.add(hash_frase)
        
        # Calcula score
        frases_score = []
        palavras_chave = ['importante', 'principal', 'essencial', 'fundamental', 
                         'conclusão', 'resultado', 'final', 'portanto', 'assim']
        
        for frase in frases_unicas:
            score = 0
            frase_lower = frase.lower()
            
            # Keywords
            for palavra in palavras_chave:
                if palavra in frase_lower:
                    score += 3
            
            # Comprimento ideal
            palavras = len(frase.split())
            score += max(0, 1 - abs(palavras - 15) / 15) * 2
            
            frases_score.append((frase, score))
        
        # Ordena e pega top 30%
        frases_score.sort(key=lambda x: x[1], reverse=True)
        qtd_resumo = max(2, len(frases_score) // 3)
        
        resumo = '. '.join([frase for frase, _ in frases_score[:qtd_resumo]]) + '.'
        return resumo

# Rota principal
@app.route('/')
def index():
    """Página inicial"""
    return render_template('index.html')

# API Resumo (usada pelo JS)
@app.route('/api/resumir', methods=['POST'])
def api_resumir():
    """API JSON para resumo"""
    try:
        data = request.json
        texto = data.get('texto', '').strip()
        
        if len(texto) < 100:
            return jsonify({
                'erro': 'Texto muito curto (mínimo 100 caracteres)'
            }), 400
        
        resumidor = ResumidorIA()
        resumo = resumidor.gerar_resumo(texto)
        
        palavras_original = resumidor.contar_palavras(texto)
        palavras_resumo = resumidor.contar_palavras(resumo)
        reducao = ((palavras_original - palavras_resumo) / palavras_original) * 100
        
        return jsonify({
            'sucesso': True,
            'resumo': resumo,
            'palavras_original': palavras_original,
            'palavras_resumo': palavras_resumo,
            'reducao': f"{reducao:.1f}%"
        })
    
    except Exception as e:
        return jsonify({
            'erro': f'Erro no processamento: {str(e)}'
        }), 500

# Arquivos estáticos
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    print("🚀 Iniciando Resumidor IA Flask...")
    print("🌐 Acesse: http://localhost:5000")
    print("🛑 Ctrl+C para parar")
    app.run(debug=True, host='0.0.0.0', port=5000)