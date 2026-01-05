import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StrategyField from './Inputs/StrategyField';

const StrategyParametersForm = ({
    gridLevels, setGridLevels,
    quantity, setQuantity,
    gridGap, setGridGap,
    upperPrice, handleUpperPriceChange,
    lowerPrice, handleLowerPriceChange,
    isApplying, onApply
}) => {
    return (
        <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sliders size={20} color="#ff00e5" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Strategy Parameters</h3>
                </div>
                <Button
                    variant="primary"
                    onClick={onApply}
                    loading={isApplying}
                    icon={!isApplying && <RefreshCw size={16} />}
                >
                    Apply
                </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <StrategyField
                    label="Grid Levels"
                    tooltip="The total number of buy and sell positions the bot will open and manage."
                    value={gridLevels}
                    onChange={setGridLevels}
                    type="number"
                />
                <StrategyField
                    label="Quantity per Level"
                    tooltip="The specific amount of the asset to be traded at every individual price point."
                    value={quantity}
                    onChange={setQuantity}
                    type="number"
                    step="0.000001"
                />
                <StrategyField
                    label="Grid Gap"
                    tooltip="The price distance or percentage difference between each trade position."
                    value={gridGap}
                    onChange={setGridGap}
                    type="number"
                />
                <StrategyField
                    label="Upper Price Limit"
                    tooltip="The ceiling price; the bot will stop placing buy orders if the market price rises above this point."
                    value={upperPrice}
                    onChange={handleUpperPriceChange}
                    type="number"
                />
                <StrategyField
                    label="Lower Price Limit"
                    tooltip="The floor price; the bot will stop placing orders if the market price drops below this point."
                    value={lowerPrice}
                    onChange={handleLowerPriceChange}
                    type="number"
                />
            </div>
        </Card>
    );
};

export default StrategyParametersForm;
