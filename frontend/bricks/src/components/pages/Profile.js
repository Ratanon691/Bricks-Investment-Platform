import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Css/Profile.css';
import { User, DollarSign, TrendingUp, Percent, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import NavBar from '../component/NavBar';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      try {
        setLoading(true);
        const [userResponse, transactionsResponse, portfolioValueResponse] = await Promise.all([
          axios.get('http://localhost:8000/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/transactions', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8000/shares/portfolio-value', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setUserProfile({
          ...userResponse.data.user,
          totalAssets: portfolioValueResponse.data.portfolioValue || 0
        });

        // Process transactions with correct fee calculation
        const processedTransactions = transactionsResponse.data.map(transaction => {
          const totalAmount = parseFloat(transaction.amount);
          // Calculate base amount and fee based on 0.2% fee
          const baseAmount = totalAmount / 1.002; // Divide by (1 + 0.002) to get base amount
          const fee = totalAmount - baseAmount; // Fee is the difference

          return {
            ...transaction,
            actualAmount: Math.round(baseAmount * 100) / 100, // Round to 2 decimal places
            fee: Math.round(fee * 100) / 100 // Round to 2 decimal places
          };
        });

        setTransactions(processedTransactions);
        setError(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch user data. Please try again.';
        setError(errorMessage);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setUserProfile(prev => ({
            ...prev,
            totalAssets: 0
          }));
          setTransactions([]);
        }
      } finally {
        setLoading(false);
      }
    };  
    
    fetchUserData();
  }, [navigate]);

  // Calculate total active properties
  const calculateTotalActiveProperties = (transactions) => {
    const propertyShares = transactions.reduce((shares, transaction) => {
      const propertyId = transaction.property_id;
      if (!shares[propertyId]) {
        shares[propertyId] = 0;
      }
      shares[propertyId] += transaction.type === 'buy' 
        ? transaction.shares 
        : -transaction.shares;
      return shares;
    }, {});

    return Object.values(propertyShares).filter(shares => shares > 0).length;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!userProfile) return <div>User not found</div>;

  // Helper function to format currency in Thai Baht
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalActiveProperties = calculateTotalActiveProperties(transactions);

  return (
    <div className="profile-page">
      <NavBar />
      <main className="content">
        <div className="profile-header">
          <User size={64} />
          <h1>{`${userProfile.firstName} ${userProfile.lastName}`}</h1>
          <p>{userProfile.email}</p>
        </div>

        <div className="assets-overview">
          <h2>Assets Overview</h2>
          <div className="assets-grid">
            <div className="asset-item">
              <DollarSign size={32} />
              <h3>Total Assets</h3>
              <p>{formatCurrency(userProfile.totalAssets || 0)}</p>
            </div>
            <div className="asset-item" onClick={() => navigate('/portfolio')} style={{ cursor: 'pointer' }}>
              <TrendingUp size={32} />
              <h3>Total Properties</h3>
              <p>{totalActiveProperties}</p>
            </div>
            <div className="asset-item">
              <Percent size={32} />
              <h3>Total Transactions</h3>
              <p>{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="transaction-history">
          <h2>Transaction History</h2>
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Shares</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className={transaction.type}>
                    <td><Clock size={16} /> {new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'buy' ? (
                        <><ArrowUpRight size={16} /> Buy</>
                      ) : (
                        <><ArrowDownRight size={16} /> Sell</>
                      )}
                    </td>
                    <td>{transaction.Property.propertyName}</td>
                    <td>{formatCurrency(transaction.actualAmount)}</td>
                    <td>{formatCurrency(transaction.fee)}</td>
                    <td>{transaction.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>            
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;