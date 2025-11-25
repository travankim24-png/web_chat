import React from 'react';
import './StickerPicker.css';

function StickerPicker({ onSelectSticker, onClose }) {
  const stickerCategories = {
    'Emoji': ['😀', '😂', '🥰', '😍', '🤩', '😎', '🤗', '🤔', '😴', '🥳', '😭', '😡', '👍', '👎', '👏', '🙏'],
    'Động vật': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
    'Trái tim': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
    'Ký hiệu': ['✨', '⭐', '🌟', '💫', '🔥', '💯', '✅', '❌', '⚡', '💥', '🎉', '🎊', '🎈', '🎁', '🏆', '🎯'],
    'Thức ăn': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🥞', '🧇', '🧈', '🍞', '🥐', '🥨', '🥯'],
    'Hoạt động': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏'],
  };

  const [activeCategory, setActiveCategory] = React.useState('Emoji');

  const handleStickerClick = (sticker) => {
    onSelectSticker(sticker);
    onClose();
  };

  return (
    <div className="sticker-picker-overlay" onClick={onClose}>
      <div className="sticker-picker" onClick={(e) => e.stopPropagation()}>
        <div className="sticker-header">
          <h3>Chọn sticker</h3>
          <button className="btn-close-sticker" onClick={onClose}>×</button>
        </div>

        <div className="sticker-categories">
          {Object.keys(stickerCategories).map(category => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="sticker-grid">
          {stickerCategories[activeCategory].map((sticker, index) => (
            <button
              key={index}
              className="sticker-item"
              onClick={() => handleStickerClick(sticker)}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StickerPicker;
