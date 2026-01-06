interface OnlineMaterialsViewProps {
  onBack: () => void;
}

interface Material {
  title: string;
  description: string;
  url: string;
  icon: string;
}

const materials: Material[] = [
  {
    title: 'ExamTopics',
    description: 'AWS Certified Solutions Architect Professional exam questions and discussions',
    url: 'https://www.examtopics.com/exams/amazon/aws-certified-solutions-architect-professional/view/',
    icon: '📋',
  },
  {
    title: 'Tutorials Dojo',
    description: 'SAP C02 sample exam questions and practice tests',
    url: 'https://tutorialsdojo.com/aws-certified-solutions-architect-professional-sap-c02-sample-exam-questions/',
    icon: '🎓',
  },
  {
    title: 'AWS Sample Questions',
    description: 'Official AWS Certified Solutions Architect Professional sample questions PDF',
    url: 'https://d1.awsstatic.com/training-and-certification/docs-sa-pro/AWS-Certified-Solutions-Architect-Professional_Sample-Questions.pdf',
    icon: '📄',
  },
  {
    title: 'All Free Dumps',
    description: 'AWS Solutions Architect Professional exam dumps and study materials',
    url: 'https://www.allfreedumps.com/downloadfile.html?id=21748',
    icon: '💾',
  },
  {
    title: 'Free Cram',
    description: 'AWS Solutions Architect Professional PDF study guide',
    url: 'https://www.freecram.net/pdf/AWS-Solutions-Architect-Professional.pdf',
    icon: '📚',
  },
];

export function OnlineMaterialsView({ onBack }: OnlineMaterialsViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            ← Back to Menu
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Online Materials</h1>
          <p className="text-blue-100 text-lg">
            Curated collection of resources for AWS SAP certification preparation
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((material, index) => (
            <a
              key={index}
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            >
              <div className="text-5xl mb-4">{material.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                {material.title}
              </h2>
              <p className="text-gray-600 mb-4">{material.description}</p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                <span>Visit</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-blue-100">
          <p className="text-sm">Click on any material to open it in a new tab</p>
        </div>
      </div>
    </div>
  );
}
