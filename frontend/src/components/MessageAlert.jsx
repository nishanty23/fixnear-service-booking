export default function MessageAlert({ message, clearMessage }) {
    if (!message) return null;

    return (
        <div className="message">
            {message}
            <button onClick={clearMessage}>×</button>
        </div>
    );
}