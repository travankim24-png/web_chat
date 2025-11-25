import React, { useState } from 'react';
import './MessageReaction.css';

function MessageReaction({ message, onReact, position = 'left' }) {
  const [showPicker, setShowPicker] = useState(false);

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🙏'];

  const handleReact = (emoji) => {
    onReact(message.id, emoji);
    setShowPicker(false);
  };

  return (
    <div className={`message-reaction-wrapper ${position}`}>
      <button 
        className="btn-add-reaction"
        onClick={() => setShowPicker(!showPicker)}
        title="Thả cảm xúc"
      >
        +
      </button>

      {showPicker && (
        <div className="reaction-picker">
          {reactions.map(emoji => (
            <button
              key={emoji}
              className="reaction-item"
              onClick={() => handleReact(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {message.reactions && message.reactions.length > 0 && (
        <div className="message-reactions">
          {message.reactions.map((reaction, index) => (
            <span key={index} className="reaction-badge" title={reaction.users?.join(', ')}>
              {reaction.emoji} {reaction.count > 1 && reaction.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageReaction;
