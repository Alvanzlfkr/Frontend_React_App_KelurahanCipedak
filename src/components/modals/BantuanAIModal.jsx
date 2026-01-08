import { useState, useRef, useEffect } from "react";
import { X, Building2, Send } from "lucide-react";
import "./BantuanAIModal.css";

const BantuanAIModal = ({ open, onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const bodyRef = useRef(null);

  // Fetch available rooms setiap kali modal dibuka
  useEffect(() => {
    if (!open) return;

    const fetchAvailableRooms = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/ruangan/tersedia");
        if (!res.ok) throw new Error("Gagal fetch ruangan tersedia");
        const data = await res.json();
        setAvailableRooms(data.rooms || []);
      } catch (err) {
        console.error(err);
        setAvailableRooms([]);
      }
    };

    fetchAvailableRooms();
    setMessages([]);
    setPrompt("");
  }, [open]);

  // Auto scroll ke bawah
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!open) return;

    const fetchAvailableRooms = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/ruangan/tersedia");
        if (!res.ok) throw new Error("Gagal fetch ruangan tersedia");
        const data = await res.json();
        setAvailableRooms(data.rooms || []);
      } catch (err) {
        console.error(err);
        setAvailableRooms([]);
      }
    };

    fetchAvailableRooms();

    // Tambahkan pesan awal AI
    setMessages([
      {
        role: "ai",
        text: "Halo, apa yang bisa saya bantu?",
        rooms: [],
        quotaLimit: false,
      },
    ]);

    setPrompt("");
  }, [open]);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      const aiMessage = {
        role: "ai",
        text: data.aiText || "Tidak ada jawaban dari AI.",
        rooms: data.rooms || [],
        quotaLimit: data.quotaLimit || false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("❌ Error AI route:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Maaf, terjadi kesalahan saat menghubungi AI.",
          rooms: [],
          quotaLimit: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="ai-modal-header">
          <h3>🤖 Bantuan AI</h3>
          <button className="ai-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* BODY CHAT */}
        <div className="ai-modal-body" ref={bodyRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-row ${msg.role === "user" ? "user" : "ai"}`}
            >
              {msg.role === "user" && (
                <div className="chat-bubble user-bubble">{msg.text}</div>
              )}

              {msg.role === "ai" && (
                <div
                  className={`chat-bubble ai-bubble ${
                    msg.quotaLimit ? "quota-limit" : ""
                  }`}
                >
                  {msg.text && <p className="ai-title">{msg.text}</p>}

                  {msg.rooms?.length > 0 && (
                    <div className="ai-room-list">
                      {msg.rooms.map((r, i) => (
                        <div key={i} className="ai-room">
                          <span className="ai-room-name">{r.nama}</span>
                          <span className="badge success">{r.keterangan}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-row ai">
              <div className="chat-bubble ai-bubble">AI sedang mengetik...</div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="ai-modal-footer">
          <input
            className="ai-input"
            placeholder="Contoh: Ruangan B tersedia jam berapa?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="ai-send-btn" onClick={handleSend}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BantuanAIModal;
