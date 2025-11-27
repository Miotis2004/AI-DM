import React, { useState } from 'react';
import './ModelSelector.css';

interface ModelInfo {
  name: string;
  displayName: string;
  size: string;
  description: string;
  speed: string;
  quality: string;
}

const MODEL_INFO: { [key: string]: ModelInfo } = {
    'mistral:latest': {
      name: 'mistral:latest',
      displayName: 'Mistral',
      size: '4.4 GB',
      description: 'Balanced - Good speed and quality (Recommended)',
      speed: 'Fast',
      quality: 'Good',
    },
    'deepseek-r1:8b': {
      name: 'deepseek-r1:8b',
      displayName: 'DeepSeek R1',
      size: '4.9 GB',
      description: 'Reasoning model - Shows detailed thinking',
      speed: 'Medium',
      quality: 'Excellent',
    },
    'gpt-oss:120b': {
      name: 'gpt-oss:120b',
      displayName: 'GPT-OSS ⚠️',
      size: '65 GB',
      description: 'VERY LARGE - May cause timeouts/crashes. Use with caution.',
      speed: 'Very Slow',
      quality: 'Exceptional',
    },
  };

interface Props {
  currentModel: string;
  availableModels: string[];
  onModelChange: (model: string) => void;
  isGenerating: boolean;
}

const ModelSelector: React.FC<Props> = ({ 
  currentModel, 
  availableModels, 
  onModelChange,
  isGenerating 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const currentModelInfo = MODEL_INFO[currentModel] || {
    name: currentModel,
    displayName: currentModel,
    size: 'Unknown',
    description: 'Custom model',
    speed: 'Unknown',
    quality: 'Unknown',
  };

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <span className="model-icon">🤖</span>
        <select
          value={currentModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={isGenerating}
          className="model-dropdown"
        >
          {availableModels.map(model => {
            const info = MODEL_INFO[model];
            return (
              <option key={model} value={model}>
                {info?.displayName || model}
              </option>
            );
          })}
        </select>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="model-info-btn"
          disabled={isGenerating}
        >
          ℹ️
        </button>
      </div>

      {showDetails && (
        <div className="model-details">
          <h4>{currentModelInfo.displayName}</h4>
          <div className="model-stat">
            <span className="stat-label">Size:</span>
            <span className="stat-value">{currentModelInfo.size}</span>
          </div>
          <div className="model-stat">
            <span className="stat-label">Speed:</span>
            <span className="stat-value">{currentModelInfo.speed}</span>
          </div>
          <div className="model-stat">
            <span className="stat-label">Quality:</span>
            <span className="stat-value">{currentModelInfo.quality}</span>
          </div>
          <p className="model-description">{currentModelInfo.description}</p>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;