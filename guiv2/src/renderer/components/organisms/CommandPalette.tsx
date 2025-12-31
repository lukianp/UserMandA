/**
 * CommandPalette Component
 *
 * Global command palette for quick actions with fuzzy search,
 * keyboard navigation, and categorized commands.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Keyboard } from 'lucide-react';

import { useModalStore } from '../../store/useModalStore';
import { createCommandRegistry, filterCommands, groupCommandsByCategory, Command } from '../../lib/commandRegistry';

/**
 * Command Palette Component
 */
export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { closeCommandPalette, openModal } = useModalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create command registry
  const commands = createCommandRegistry(
    navigate,
    (type, data) => {
      closeCommandPalette();
      setTimeout(() => openModal({ type: type as any, title: '', dismissable: true, data }), 100);
    },
    (action) => {
      closeCommandPalette();
      setTimeout(() => {
        const event = new CustomEvent(`app:${action}`);
        window.dispatchEvent(event);
      }, 100);
    }
  );

  // Filter commands based on search
  const filteredCommands = filterCommands(commands, searchQuery);
  const groupedCommands = groupCommandsByCategory(filteredCommands);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCommandPalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          executeCommand(selectedCommand);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, closeCommandPalette]);

  const executeCommand = (command: Command) => {
    command.action();
    closeCommandPalette();
  };

  const handleCommandClick = (command: Command) => {
    executeCommand(command);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
      onClick={closeCommandPalette}
      data-cy="command-palette-overlay"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        data-cy="command-palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 outline-none placeholder-gray-400 text-lg"
            data-cy="command-palette-input"
          />
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto" data-cy="command-list">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No commands found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            groupedCommands.map((category, categoryIndex) => (
              <div key={category.name} className={categoryIndex > 0 ? 'mt-2' : ''}>
                {/* Category Header */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {category.name}
                  </h3>
                </div>

                {/* Category Commands */}
                {category.commands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={command.id}
                      onClick={() => handleCommandClick(command)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'
                      }`}
                      data-cy={`command-${command.id}`}
                    >
                      {/* Icon */}
                      {command.icon && (
                        <command.icon
                          className={`w-5 h-5 flex-shrink-0 ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                          }`}
                        />
                      )}

                      {/* Label and Description */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${
                            isSelected
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {command.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {command.description}
                        </div>
                      </div>

                      {/* Keyboard Shortcut */}
                      {command.shortcut && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {command.shortcut.split('+').map((key, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="text-gray-400 text-xs">+</span>}
                              <kbd
                                className={`px-2 py-1 text-xs rounded ${
                                  isSelected
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                ↵
              </kbd>
              <span>Select</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Keyboard className="w-4 h-4" />
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </div>
    </div>
  );
};


