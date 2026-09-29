import React, { useState, useRef } from 'react';
import { TextField, IconButton, Box, Paper } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiPicker from 'emoji-picker-react';

/**
 * EmojiInput – a TextField (or textarea) with an inline emoji picker.
 *
 * Props are forwarded to the underlying MUI TextField, so it works for
 * single‑line inputs as well as multiline TextField (used for post creation).
 *
 * The component maintains its own picker visibility state. When an emoji is
 * selected, it is inserted at the current caret position, the input regains focus
 * and the caret moves right after the inserted emoji.
 */
export default function EmojiInput({ value, onChange, ...rest }) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);

  const togglePicker = () => setShowPicker((prev) => !prev);

  const handleEmojiClick = (event, emojiObject) => {
    if (!inputRef.current) return;
    const caretPos = inputRef.current.selectionStart || 0;
    const emoji = emojiObject.emoji; // unicode character
    const newValue = value.slice(0, caretPos) + emoji + value.slice(caretPos);
    // propagate change upward – mimic native event shape
    onChange({ target: { value: newValue } });
    // move caret after inserted emoji
    const newPos = caretPos + emoji.length;
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <TextField
        {...rest}
        inputRef={inputRef}
        value={value}
        onChange={onChange}
        sx={{ flexGrow: 1 }}
      />
      <IconButton
        onClick={togglePicker}
        size="small"
        sx={{ ml: 1 }}
        aria-label="emoji picker"
      >
        <InsertEmoticonIcon />
      </IconButton>
      {showPicker && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 1,
            zIndex: 1300,
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            height={350}
            width={300}
          />
        </Paper>
      )}
    </Box>
  );
}
