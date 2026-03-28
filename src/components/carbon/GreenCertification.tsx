import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  Calendar, 
  Target, 
  Zap, 
  Leaf, 
  Building, 
  Shield, 
  ExternalLink, 
  Search, 
  Filter, 
  Info
} from 'lucide-react';
import { useCarbonTracking } from '../../hooks/useCarbonTracking';
import { 
  GreenCertification, 
  CertificationType, 
  CertificationStatus, 
  CertificationCriteria,
  DocumentType 
} from '../../types/carbon';

interface GreenCertificationProps {
  userId: string;
}

export const GreenCertification: React.FC<GreenCertificationProps> = ({ userId }) => {
  const { 
    state, 
    loadCertifications, 
    addCertification 
  } = useCarbonTracking({ userId });

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<GreenCertification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CertificationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CertificationStatus | 'all'>('all');

  const filteredCertifications = state.certifications.filter(cert => {
    if (searchTerm && !cert.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && cert.type !== filterType) return false;
    if (filterStatus !== 'all' && cert.status !== filterStatus) return false;
    return true;
  });

  const getCertificationIcon = (type: CertificationType) => {
    switch (type) {
      case CertificationType.LEED:
        return <Building className="h-5 w-5" />;
      case CertificationType.BREEAM:
        return <Award className="h-5 w-5" />;
      case CertificationType.ENERGY_STAR:
        return <Zap className="h-5 w-5" />;
      case CertificationType.GREEN_BUILDING:
        return <Leaf className="h-5 w-5" />;
      case CertificationType.CARBON_NEUTRAL:
        return <Target className="h-5 w-5" />;
      case CertificationType.CLIMATE_NEUTRAL:
        return <Shield className="h-5 w-5" />;
      case CertificationType.NET_ZERO:
        return <CheckCircle className="h-5 w-5" />;
      case CertificationType.SCIENCE_BASED_TARGETS:
        return <Target className="h-5 w-5" />;
      case CertificationType.ISO_14001:
        return <Shield className="h-5 w-5" />;
      case CertificationType.ISO_14064:
        return <Shield className="h-5 w-5" />;
      case CertificationType.GHG_PROTOCOL:
        return <Leaf className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getCertificationColor = (type: CertificationType) => {
    switch (type) {
      case CertificationType.LEED:
        return 'text-green-600 bg-green-50';
      case CertificationType.BREEAM:
        return 'text-blue-600 bg-blue-50';
      case CertificationType.ENERGY_STAR:
        return 'text-yellow-600 bg-yellow-50';
      case CertificationType.GREEN_BUILDING:
        return 'text-emerald-600 bg-emerald-50';
      case CertificationType.CARBON_NEUTRAL:
        return 'text-gray-600 bg-gray-50';
      case CertificationType.CLIMATE_NEUTRAL:
        return 'text-cyan-600 bg-cyan-50';
      case CertificationType.NET_ZERO:
        return 'text-indigo-600 bg-indigo-50';
      case CertificationType.SCIENCE_BASED_TARGETS:
        return 'text-purple-600 bg-purple-50';
      case CertificationType.ISO_14001:
        return 'text-red-600 bg-red-50';
      case CertificationType.ISO_14064:
        return 'text-orange-600 bg-orange-50';
      case CertificationType.GHG_PROTOCOL:
        return 'text-teal-600 bg-teal-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: CertificationStatus) => {
    switch (status) {
      case CertificationStatus.ACTIVE:
        return 'text-green-600 bg-green-50';
      case CertificationStatus.EXPIRED:
        return 'text-red-600 bg-red-50';
      case CertificationStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50';
      case CertificationStatus.SUSPENDED:
        return 'text-orange-600 bg-orange-50';
      case CertificationStatus.REVOKED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: CertificationStatus) => {
    switch (status) {
      case CertificationStatus.ACTIVE:
        return <CheckCircle className="h-4 w-4" />;
      case CertificationStatus.EXPIRED:
        return <AlertTriangle className="h-4 w-4" />;
      case CertificationStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case CertificationStatus.SUSPENDED:
        return <AlertTriangle className="h-4 w-4" />;
      case CertificationStatus.REVOKED:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddCertification = async (certification: Omit<GreenCertification, 'id'>) => {
    const success = await addCertification(certification);
    if (success) {
      setShowAddForm(false);
    }
  };

  const renderCertificationCard = (certification: GreenCertification) => {
    const daysUntilExpiry = certification.expiresAt 
      ? Math.ceil((certification.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    const achievedCriteria = certification.criteria.filter(c => c.achieved).length;
    const totalCriteria = certification.criteria.length;
    const completionPercentage = totalCriteria > 0 ? (achievedCriteria / totalCriteria) * 100 : 0;

    return (
      <div key={certification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getCertificationColor(certification.type)}`}>
              {getCertificationIcon(certification.type)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{certification.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCertificationColor(certification.type)}`}>
                  {certification.type.replace('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certification.status)}`}>
                  {getStatusIcon(certification.status)}
                  <span className="ml-1">{certification.status.charAt(0).toUpperCase() + certification.status.slice(1)}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedCertification(selectedCertification === certification.id ? null : certification.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Certificate Number</p>
              <p className="font-medium text-gray-900">{certification.certificateNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Issuer</p>
              <p className="font-medium text-gray-900">{certification.issuer}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Issued</p>
              <p className="font-medium text-gray-900">{certification.issuedAt.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expires</p>
              <p className={`font-medium ${
                daysUntilExpiry && daysUntilExpiry < 30 ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {certification.expiresAt ? certification.expiresAt.toLocaleDateString() : 'No expiration'}
                {daysUntilExpiry && daysUntilExpiry < 30 && (
                  <span className="ml-2 text-orange-600">
                    ({daysUntilExpiry} days)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Criteria Achievement</span>
              <span className="font-medium text-gray-900">
                {achievedCriteria}/{totalCriteria} ({completionPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  completionPercentage >= 100 ? 'bg-green-500' :
                  completionPercentage >= 75 ? 'bg-blue-500' :
                  completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {certification.verifiedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Verified</span>
              <span className="font-medium text-green-600">
                {certification.verifiedAt.toLocaleDateString()}
              </span>
            </div>
          )}

          {selectedCertification === certification.id && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Certification Criteria</h4>
              <div className="space-y-2">
                {certification.criteria.map((criteria, index) => (
                  <div key={criteria.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          criteria.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {criteria.required ? 'Required' : 'Optional'}
                        </span>
                        <span className="font-medium text-gray-900">{criteria.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{criteria.description}</p>
                      {criteria.value !== undefined && (
                        <div className="text-sm text-gray-600 mt-1">
                          Current: {criteria.value} {criteria.unit}
                          {criteria.threshold && ` / Target: ${criteria.threshold} ${criteria.unit}`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {criteria.achieved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-medium text-gray-900 mb-3 mt-4">Documents</h4>
              <div className="space-y-2">
                {certification.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-600">{doc.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <button
                        onClick={() => window.open(doc.url, '_blank')}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAddForm = () => {
    const newCertification = {
      userId,
      type: CertificationType.LEED,
      name: '',
      issuer: '',
      certificateNumber: '',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: CertificationStatus.ACTIVE,
      criteria: [],
      documents: [],
      metadata: {}
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Certification</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={newCertification.type}
              >
                {Object.values(CertificationType).map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={newCertification.status}
              >
                {Object.values(CertificationStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter certification name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuer
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter issuer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter certificate number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <Info className="h-4 w-4" />
              <span>
                You can add criteria and documents after creating the certification.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setShowAddForm(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddCertification(newCertification)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Certification
          </button>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const activeCertifications = filteredCertifications.filter(c => c.status === CertificationStatus.ACTIVE);
    const expiredCertifications = filteredCertifications.filter(c => c.status === CertificationStatus.EXPIRED);
    const pendingCertifications = filteredCertifications.filter(c => c.status === CertificationStatus.PENDING);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certification Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Certifications</span>
            <span className="text-xl font-bold text-gray-900">{filteredCertifications.length}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-900">{activeCertifications.length}</div>
              <div className="text-sm text-green-600">Active</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-900">{pendingCertifications.length}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-900">{expiredCertifications.length}</div>
              <div className="text-sm text-red-600">Expired</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Certification Types</h4>
            <div className="space-y-2">
              {Object.values(CertificationType).map(type => {
                const count = filteredCertifications.filter(c => c.type === type).length;
                if (count === 0) return null;
                
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getCertificationColor(type).split(' ')[1]}`} />
                      <span className="text-gray-900">{type.replace('_', ' ')}</span>
                    </div>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Green Certifications</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </button>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as CertificationType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Types</option>
              {Object.values(CertificationType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CertificationStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              {Object.values(CertificationStatus).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search certifications..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6">
          {renderAddForm()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredCertifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Certifications</h3>
                <p className="text-gray-600 mb-6">
                  Add your first green certification to track your environmental achievements and validate your sustainability claims.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Certification
                </button>
              </div>
            ) : (
              filteredCertifications.map(renderCertificationCard)
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {renderSummary()}
        </div>
      </div>
    </div>
  );
};
