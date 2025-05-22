import React from 'react'
import { LayoutDashboard, Users, FileText, Building2, BarChart2, Settings, DollarSign, Clock, CheckCircle2, TrendingUp, LogOut } from "lucide-react"

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

interface CardTitleProps {
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${className}`}
    {...props}
  >
    {children}
  </button>
)

const RoleViewsPreview: React.FC = () => {
  const [viewType, setViewType] = React.useState('manager')

  const [managerTab, setManagerTab] = React.useState('dashboard')
  const [agentTab, setAgentTab] = React.useState('dashboard')

  const ManagerView: React.FC = () => (
    <div className="flex h-full bg-gray-100">
      {/* Manager Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">LegacyCore Manager</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setManagerTab('dashboard')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${managerTab === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setManagerTab('agents')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${managerTab === 'agents' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <Users className="h-5 w-5" />
            <span>Agents</span>
          </button>
          <button 
            onClick={() => setManagerTab('applications')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${managerTab === 'applications' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <FileText className="h-5 w-5" />
            <span>All Applications</span>
          </button>
          <button 
            onClick={() => setManagerTab('carriers')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${managerTab === 'carriers' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <Building2 className="h-5 w-5" />
            <span>Carriers</span>
          </button>
          <button 
            onClick={() => setManagerTab('analytics')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${managerTab === 'analytics' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          <button 
            onClick={() => setManagerTab('settings')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${managerTab === 'settings' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </nav>
        <button className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 mt-auto">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Manager Content */}
      <div className="flex-1 overflow-auto p-8">
        {managerTab === 'dashboard' && (
          <>
            <h1 className="text-3xl font-bold mb-8">Manager Dashboard</h1>
            
            {/* Team Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Total Applications</CardTitle>
                  <BarChart2 className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Total Commission</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$245,680</div>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Approval Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">82%</div>
                  <p className="text-xs text-gray-500">Organization-wide</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Top Agent</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Sarah Johnson</div>
                  <p className="text-xs text-gray-500">Highest commission</p>
                </CardContent>
              </Card>
            </div>

            {/* Agent Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Apps</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Sarah Johnson</td>
                        <td className="px-6 py-4 whitespace-nowrap">45</td>
                        <td className="px-6 py-4 whitespace-nowrap">38</td>
                        <td className="px-6 py-4 whitespace-nowrap">5</td>
                        <td className="px-6 py-4 whitespace-nowrap">$85,400</td>
                        <td className="px-6 py-4 whitespace-nowrap">84%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Michael Chen</td>
                        <td className="px-6 py-4 whitespace-nowrap">38</td>
                        <td className="px-6 py-4 whitespace-nowrap">30</td>
                        <td className="px-6 py-4 whitespace-nowrap">6</td>
                        <td className="px-6 py-4 whitespace-nowrap">$72,150</td>
                        <td className="px-6 py-4 whitespace-nowrap">79%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Emily Davis</td>
                        <td className="px-6 py-4 whitespace-nowrap">31</td>
                        <td className="px-6 py-4 whitespace-nowrap">26</td>
                        <td className="px-6 py-4 whitespace-nowrap">3</td>
                        <td className="px-6 py-4 whitespace-nowrap">$58,300</td>
                        <td className="px-6 py-4 whitespace-nowrap">84%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {managerTab === 'agents' && (
          <>
            <h1 className="text-3xl font-bold mb-8">Agent Management</h1>
            <Card>
              <CardHeader>
                <CardTitle>Active Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson'].map((agent) => (
                    <div key={agent} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium">{agent}</p>
                        <p className="text-sm text-gray-500">Licensed Agent</p>
                      </div>
                      <Button>View Details</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {managerTab === 'applications' && (
          <>
            <h1 className="text-3xl font-bold mb-8">All Applications</h1>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Face Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Commission</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">John Smith</td>
                        <td className="px-6 py-4 whitespace-nowrap">Sarah Johnson</td>
                        <td className="px-6 py-4 whitespace-nowrap">Americo</td>
                        <td className="px-6 py-4 whitespace-nowrap">$500,000</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">approved</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">$6,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {managerTab === 'carriers' && (
          <>
            <h1 className="text-3xl font-bold mb-8">Carrier Performance</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Americo', 'Mutual of Omaha', 'Aetna', 'Corebridge'].map((carrier) => (
                <Card key={carrier}>
                  <CardHeader>
                    <CardTitle>{carrier}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">Approval Rate: 85%</p>
                      <p className="text-sm">Avg Processing Time: 12 days</p>
                      <p className="text-sm">Total Commission: $50,000</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {managerTab === 'analytics' && (
          <>
            <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Performance Charts</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {managerTab === 'settings' && (
          <>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Upline Split %</label>
                    <input type="number" defaultValue="20" className="border rounded px-3 py-2" />
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )

  const AgentView: React.FC = () => (
    <div className="flex h-full bg-gray-100">
      {/* Agent Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">LegacyCore Agent</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setAgentTab('dashboard')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${agentTab === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setAgentTab('applications')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${agentTab === 'applications' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <FileText className="h-5 w-5" />
            <span>My Applications</span>
          </button>
          <button 
            onClick={() => setAgentTab('commissions')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${agentTab === 'commissions' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Commissions</span>
          </button>
          <button 
            onClick={() => setAgentTab('carriers')}
            className={`flex items-center space-x-2 p-2 rounded w-full text-left ${agentTab === 'carriers' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
          >
            <Building2 className="h-5 w-5" />
            <span>Carriers</span>
          </button>
        </nav>
        <button className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 mt-auto">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Agent Content */}
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30</div>
              <p className="text-xs text-gray-500">79% approval rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Pending</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-gray-500">In processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Your Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$57,720</div>
              <p className="text-xs text-gray-500">After upline split</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-medium">Robert Wilson</p>
                  <p className="text-sm text-gray-500">Americo - Whole Life</p>
                  <p className="text-xs text-gray-400">Face Amount: $500,000</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">approved</span>
                  <p className="text-sm text-gray-500 mt-1">Expected: $6,000</p>
                </div>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="font-medium">Maria Garcia</p>
                  <p className="text-sm text-gray-500">Mutual of Omaha - Term Life</p>
                  <p className="text-xs text-gray-400">Face Amount: $750,000</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">underwriting</span>
                  <p className="text-sm text-gray-500 mt-1">Expected: $4,500</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">James Thompson</p>
                  <p className="text-sm text-gray-500">Corebridge - Universal Life</p>
                  <p className="text-xs text-gray-400">Face Amount: $300,000</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">pending</span>
                  <p className="text-sm text-gray-500 mt-1">Expected: $3,600</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="w-full h-[calc(100vh-12rem)] flex flex-col border rounded-lg overflow-hidden">
      {/* Toggle Buttons */}
      <div className="bg-white border-b p-4 flex items-center justify-center space-x-4">
        <button
          onClick={() => setViewType('manager')}
          className={`px-4 py-2 rounded-md ${
            viewType === 'manager' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Manager View
        </button>
        <button
          onClick={() => setViewType('agent')}
          className={`px-4 py-2 rounded-md ${
            viewType === 'agent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Agent View
        </button>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {viewType === 'manager' ? <ManagerView /> : <AgentView />}
      </div>
    </div>
  )
}

export default RoleViewsPreview 