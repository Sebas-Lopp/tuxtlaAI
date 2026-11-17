import { useState } from 'react';
import { chat } from '../api';

export default function Chatbot({ open, setOpen }) {
    const [messages, setMessages] = useState([
        { role: 'bot', text: '¡Hola! 👋 Soy TuxtlaResponde AI. Pregúntame qué está pasando en la ciudad y te haré un resumen.' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const send = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;
        setMessages((m) => [...m, { role: 'user', text }]);
        setInput('');
        setLoading(true);
        try {
            const r = await chat(text);
            setMessages((m) => [...m, { role: 'bot', text: r.reply }]);
        } catch (err) {
            setMessages((m) => [...m, { role: 'bot', text: 'Lo siento, no pude conectar con el asistente. 😕' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="fab" onClick={() => setOpen(!open)} aria-label="Abrir chatbot">
                {open ? '✕' : '🤖'}
            </button>

            {open && (
                <div className="chat-panel">
                    <div className="chat-head">
                        <span>🤖 TuxtlaResponde AI</span>
                        <small>Resumen de la ciudad</small>
                    </div>
                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
                        ))}
                        {loading && <div className="chat-msg bot typing">Escribiendo…</div>}
                    </div>
                    <form className="chat-input" onSubmit={send}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="¿Qué está pasando en la ciudad?"
                        />
                        <button type="submit" disabled={loading}>➤</button>
                    </form>
                </div>
            )}
        </>
    );
}
