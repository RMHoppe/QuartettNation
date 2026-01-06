-- Add created_by column to decks table to track ownership
ALTER TABLE decks ADD COLUMN created_by text;
