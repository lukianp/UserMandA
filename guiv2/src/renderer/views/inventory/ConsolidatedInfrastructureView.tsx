/**
 * Consolidated Infrastructure View
 *
 * Displays consolidated infrastructure entities from all discovery sources
 */

import React, { useState } from 'react';
import { InventoryList } from '../../components/organisms/InventoryList';
import type { InventoryEntity } from '../../types/models/inventory';

export const ConsolidatedInfrastructureView: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<InventoryEntity | null>(null);

  const handleEntityClick = (entity: InventoryEntity) => {
    setSelectedEntity(entity);
    // TODO: Open fact sheet panel
    console.log('[ConsolidatedInfrastructureView] Entity clicked:', entity);
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <InventoryList
        entityType="INFRASTRUCTURE"
        sourceProfileId="current" // TODO: Get from profile store
        onEntityClick={handleEntityClick}
      />
    </div>
  );
};

export default ConsolidatedInfrastructureView;


