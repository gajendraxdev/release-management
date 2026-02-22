import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getRelease, createRelease, updateRelease, toggleStep } from '../api';

const ReleaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    additional_info: ''
  });
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchRelease();
    }
  }, [id]);

  const fetchRelease = async () => {
    try {
      setLoading(true);
      const response = await getRelease(id);
      const release = response.data;
      setFormData({
        name: release.name,
        date: release.date.split('T')[0], // Format for date input
        additional_info: release.additional_info || ''
      });
      setSteps(release.steps || []);
    } catch (err) {
      toast.error('Failed to load release');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepToggle = async (stepIndex) => {
    if (isNew) {
      // For new releases, update local state
      const newSteps = [...steps];
      newSteps[stepIndex].completed = !newSteps[stepIndex].completed;
      setSteps(newSteps);
    } else {
      // For existing releases, call API
      try {
        const response = await toggleStep(id, stepIndex);
        setSteps(response.data.steps);
      } catch (err) {
        toast.error('Failed to toggle step');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error('Name and date are required');
      return;
    }

    try {
      setSaving(true);

      if (isNew) {
        const response = await createRelease({
          name: formData.name,
          date: new Date(formData.date).toISOString(),
          additional_info: formData.additional_info || null
        });
        toast.success('Release created successfully');
        navigate(`/release/${response.data.id}`);
      } else {
        await updateRelease(id, {
          name: formData.name,
          date: new Date(formData.date).toISOString(),
          additional_info: formData.additional_info || null
        });
        toast.success('Release updated successfully');
      }
    } catch (err) {
      toast.error('Failed to save release');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Initialize steps for new release
  useEffect(() => {
    if (isNew && steps.length === 0) {
      const defaultSteps = [
        'All PRs merged',
        'CHANGELOG updated',
        'Tests passing',
        'Release created in GitHub',
        'Deployed to staging',
        'Tested in staging',
        'Deployed to production'
      ].map(name => ({ name, completed: false }));
      setSteps(defaultSteps);
    }
  }, [isNew]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading release...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base"
        >
          ← Back to Releases
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {isNew ? 'Create New Release' : 'Release Details'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="space-y-6">
          {/* Release Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Release Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., v1.2.0"
            />
          </div>

          {/* Release Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Release Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Checklist Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Checklist Steps
            </label>
            <div className="space-y-2 border border-gray-200 rounded-md p-3 sm:p-4">
              {steps.map((step, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={step.completed || false}
                    onChange={() => handleStepToggle(index)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${step.completed ? 'text-green-600' : 'text-gray-900'}`}>
                    {step.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              id="additional_info"
              name="additional_info"
              value={formData.additional_info}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes or information about this release..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isNew ? 'Create Release' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReleaseDetail;
