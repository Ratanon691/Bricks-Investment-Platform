import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import '../Css/BuySellPopup.css';

const BuySellPopup = ({ isOpen, onClose, action, property, userShares, userId, onTransactionComplete }) => {
  const [shareAmount, setShareAmount] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [fee, setFee] = useState(0);
  const [baseAmount, setBaseAmount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ownershipPercentage, setOwnershipPercentage] = useState(0);
  const [error, setError] = useState('');

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (amount) => {
    return `฿${formatNumber(parseFloat(amount).toFixed(2))}`;
  };

  useEffect(() => {
    if (shareAmount && !isNaN(shareAmount)) {
      // Calculate cost and fee
      const shareCost = parseInt(shareAmount) * property.pricePerShare;
      const calculatedFee = 0.002 * shareCost;
      setBaseAmount(shareCost);
      setFee(calculatedFee);
      setTotalCost(shareCost + calculatedFee);

      let finalShares;
      if (action === 'Buy') {
        finalShares = parseInt(shareAmount);
      } else {
        // For selling, subtract from current shares
        finalShares = userShares - parseInt(shareAmount);
      }
      
      // Ownership % calc
      const percentage = (finalShares / property.totalShares) * 100;
      setOwnershipPercentage(Math.max(0, percentage)); // Ensure percentage is not negative
    } else {
      setBaseAmount(0);
      setTotalCost(0);
      setFee(0);
      setOwnershipPercentage(0);
    }
  }, [shareAmount, property.pricePerShare, property.totalShares, userShares, action]);

  const handleShareAmountChange = (e) => {
    const value = e.target.value;
    // Remove commas from input before validation
    const cleanValue = value.replace(/,/g, '');
    if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
      setShareAmount(cleanValue);
      setError('');
    }
  };

  const validateTransaction = () => {
    //no input
    if (!shareAmount || isNaN(shareAmount) || parseInt(shareAmount) <= 0) { 
      setError('Please enter a valid number of shares.');
      return false;
    }
    //buy too many
    if (action === 'Buy' && parseInt(shareAmount) > property.availableShares) {
      setError('Not enough shares available for purchase.');
      return false;
    }
    //sell too many
    if (action === 'Sell' && parseInt(shareAmount) > userShares) {
      setError('You do not own enough shares to sell.');
      return false;
    }

    return true;
  };

  const handleConfirmOrder = async () => {
    if (!validateTransaction()) {
      return;
    }
    //send order
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/transactions', {
        userId: userId,
        propertyId: property.id,
        type: action.toLowerCase(),
        shares: parseInt(shareAmount),
        amount: totalCost
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Transaction response:', response.data);
      setShowConfirmation(true); //render confirmation msg
      onTransactionComplete();
    } catch (error) {
      console.error('Error processing transaction:', error);
      setError(error.response?.data?.message || 'Failed to process transaction. Please try again.');
    }
  };    

  const closeConfirmation = () => {
    setShowConfirmation(false);
    onClose();
  };

  const renderConfirmationMessage = () => {
    if (action === 'Buy') {
      return (
        <>
          <h2>Congratulations!</h2>
          <p>You now own {ownershipPercentage.toFixed(4)}% of {property.propertyName}</p>
          <p>You purchased {formatNumber(shareAmount)} shares</p>
          <p>Base amount: {formatCurrency(baseAmount)}</p>
          <p>Fee: {formatCurrency(fee)}</p>
          <p>Total paid: {formatCurrency(totalCost)}</p>
        </>
      );
    } else {
      return (
        <>
          <h2>Congratulations!</h2>
          <p>You sold {formatNumber(shareAmount)} shares of {property.propertyName}</p>
          <p>Base amount: {formatCurrency(baseAmount)}</p>
          <p>Fee: {formatCurrency(fee)}</p>
          <p>Total received: {formatCurrency(totalCost)}</p>
        </>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {!showConfirmation ? (
          <>
            <div className="popup-header">
              <h2 className="popup-title">
                <span className={`action-label ${action.toLowerCase()}-action`}>{action}</span> Property
              </h2>
              <button onClick={onClose} className="close-button">
                <X size={24} />
              </button>
            </div>
            
            <div className="property-info">
              <p className="property-name">{property.propertyName}</p>
              <p className="property-price">{formatCurrency(property.pricePerShare)} per share</p>
              <p className="user-shares">You own: {formatNumber(userShares)} shares</p>
              <p className="available-shares">Available shares: {formatNumber(property.availableShares)}</p>
            </div>
            
            <div className="input-group">
              <label htmlFor="shareAmount" className="input-label">Share Amount</label>
              <input
                type="text"
                id="shareAmount"
                value={shareAmount ? formatNumber(shareAmount) : ''}
                onChange={handleShareAmountChange}
                className="share-input"
                placeholder="Enter number of shares"
              />
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="cost-summary">
              <div className="cost-item">
                <span>Base amount:</span>
                <span>{formatCurrency(baseAmount)}</span>
              </div>
              <div className="cost-item">
                <span>Fee (0.2%):</span>
                <span>{formatCurrency(fee)}</span>
              </div>
              <div className="cost-item">
                <span>Total {action === 'Buy' ? 'cost' : 'to receive'}:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
            </div>
            
            <button
              onClick={handleConfirmOrder}
              className={`confirm-button ${action.toLowerCase()}-button`}
              disabled={!shareAmount || error}
            >
              Confirm {action} Order
            </button>
          </>
        ) : (
          <div className="confirmation-popup">
            {renderConfirmationMessage()}
            <button onClick={closeConfirmation} className="close-button">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuySellPopup;