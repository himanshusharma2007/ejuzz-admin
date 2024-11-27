import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, ComposedChart 
} from 'recharts';
import { 
  TrendingUp, Users, CreditCard, ShoppingCart, 
  DollarSign, Activity, Layers, Briefcase, 
  TrendingDown, BarChart as BarChartIcon 
} from 'lucide-react';

const mockData = {
  transactions: [
    { month: 'Jan', revenue: 4000, fees: 2400, volume: 1200 },
    { month: 'Feb', revenue: 3000, fees: 1398, volume: 1100 },
    { month: 'Mar', revenue: 2000, fees: 9800, volume: 1300 },
    { month: 'Apr', revenue: 2780, fees: 3908, volume: 1450 },
    { month: 'May', revenue: 1890, fees: 4800, volume: 1250 },
    { month: 'Jun', revenue: 2390, fees: 3800, volume: 1350 },
  ],
  userDistribution: [
    { name: 'New Users', value: 400, color: '#3B82F6' },
    { name: 'Active Users', value: 300, color: '#10B981' },
    { name: 'Inactive Users', value: 100, color: '#F43F5E' },
  ],
  merchantStats: [
    { name: 'Total Merchants', value: 250, icon: Briefcase, color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { name: 'Active Merchants', value: 200, icon: CreditCard, color: 'bg-green-100', iconColor: 'text-green-600' },
    { name: 'New Merchants', value: 50, icon: Activity, color: 'bg-purple-100', iconColor: 'text-purple-600' },
  ],
  performanceMetrics: [
    { name: 'Conversion Rate', value: '4.5%', trend: 2.3, icon: BarChartIcon, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { name: 'Avg Order Value', value: '$245', trend: 5.1, icon: DollarSign, color: 'bg-green-100', iconColor: 'text-green-600' },
    { name: 'Customer Retention', value: '78%', trend: -1.7, icon: Users, color: 'bg-rose-100', iconColor: 'text-rose-600' },
  ],
  revenueBreakdown: [
    { name: 'E-commerce', value: 45, color: '#3B82F6' },
    { name: 'Banking Services', value: 30, color: '#10B981' },
    { name: 'Merchant Fees', value: 25, color: '#F43F5E' },
  ]
};

const StatCard = ({ icon: Icon, title, value, trend, color = 'bg-blue-100', iconColor = 'text-blue-600' }) => (
  <div className={`bg-white shadow-lg rounded-xl p-5 transform transition-all hover:scale-105 hover:shadow-xl`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`${color} p-3 rounded-full`}>
        <Icon className={`${iconColor}`} size={24} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <h3 className="text-xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const NavTab = ({ children, isActive, onClick }) => (
    <button 
      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Admin Dashboard
        </h1>
      </div>
      
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          title="Total Users" 
          value="5,420" 
          trend={12.5}
          color="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard 
          icon={ShoppingCart} 
          title="Total Transactions" 
          value="12,345" 
          trend={8.2}
          color="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Revenue" 
          value="$456,789" 
          trend={15.3}
          color="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {mockData.performanceMetrics.map((metric, index) => (
          <StatCard 
            key={index}
            icon={metric.icon}
            title={metric.name}
            value={metric.value}
            trend={metric.trend}
            color={metric.color}
            iconColor={metric.iconColor}
          />
        ))}
      </div>

      {/* Charts and Detailed Insights */}
      <div className="grid grid-cols-2 gap-8">
        {/* Transaction Revenue Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Transactions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={mockData.transactions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={3} />
              <Line type="monotone" dataKey="fees" stroke="#10B981" name="Fees" strokeWidth={3} />
              <Bar dataKey="volume" barSize={20} fill="#F43F5E" name="Transaction Volume" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.revenueBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                stroke="none"
              >
                {mockData.revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '10px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              <Legend 
                iconType="circle"
                align="center"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Merchant Overview */}
      <div className="bg-white shadow-lg rounded-xl p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Merchant Overview</h2>
        <div className="grid grid-cols-3 gap-6">
          {mockData.merchantStats.map((stat, index) => (
            <StatCard 
              key={index}
              icon={stat.icon}
              title={stat.name}
              value={stat.value}
              color={stat.color}
              iconColor={stat.iconColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;