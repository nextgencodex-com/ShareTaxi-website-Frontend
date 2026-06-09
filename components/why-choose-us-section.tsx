import { UserCheck, Wrench, MoreHorizontal } from "lucide-react"

const benefits = [
  {
    icon: UserCheck,
    title: "Professional Drivers",
    description: "Licensed and experienced drivers with excellent safety records",
    bgColor: "bg-blue-500",
  },
  {
    icon: Wrench,
    title: "Well-Maintained",
    description: "Regular maintenance and safety inspections ensure reliability",
    bgColor: "bg-green-500",
  },
  {
    icon: MoreHorizontal,
    title: "Flexible Options",
    description: "Various vehicle sizes to accommodate different group needs",
    bgColor: "bg-red-500",
  },
]

export function WhyChooseUsSection() {
  return (
    <section id="why-choose-us-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">Why Choose Our Fleet?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div
                className={`${benefit.bgColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <benefit.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
