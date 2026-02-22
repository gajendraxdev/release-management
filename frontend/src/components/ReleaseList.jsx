import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getReleases, deleteRelease } from '../api';

const ReleaseList = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const response = await getReleases();
      setReleases(response.data);
    } catch (err) {
      toast.error('Failed to load releases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this release?')) {
      try {
        await deleteRelease(id);
        toast.success('Release deleted successfully');
        fetchReleases();
      } catch (err) {
        toast.error('Failed to delete release');
        console.error(err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned':
        return 'bg-gray-100 text-gray-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading releases...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">All Releases</h2>
        <button
          onClick={() => navigate('/release/new')}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          New Release
        </button>
      </div>

      {releases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
          <p className="text-gray-600 mb-4">No releases yet.</p>
          <button
            onClick={() => navigate('/release/new')}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Create Your First Release
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="sm:hidden space-y-3">
            {releases.map((release) => (
              <div
                key={release.id}
                onClick={() => navigate(`/release/${release.id}`)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">{release.name}</h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                      release.status
                    )}`}
                  >
                    {release.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{formatDate(release.date)}</p>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/release/${release.id}`);
                    }}
                    className="flex-1 text-sm font-medium text-blue-600 hover:text-blue-800 py-2"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => handleDelete(release.id, e)}
                    className="flex-1 text-sm font-medium text-red-600 hover:text-red-800 py-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Release Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {releases.map((release) => (
                    <tr
                      key={release.id}
                      onClick={() => navigate(`/release/${release.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {release.name}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(release.date)}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            release.status
                          )}`}
                        >
                          {release.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => handleDelete(release.id, e)}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/release/${release.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReleaseList;
