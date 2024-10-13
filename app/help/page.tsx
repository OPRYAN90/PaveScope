'use client'

import React, { useState } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Input } from "../../components/Login/ui/input"
import { Button } from "../../components/Login/ui/button"
import { Search, Mail, Phone, MessageCircle } from 'lucide-react'

const faqs = [
  {
    question: "I am not able to run inference with the model on my images. What should I do?",
    answer: "Occasionally, the HuggingFace API takes time to warm up. If you encounter this issue, please try again after a short wait. The model should then be able to process your images successfully."
  },
  {
    question: "How do I upload images for analysis?",
    answer: "Navigate to the Upload page, click on the 'Choose Files' button or drag and drop your images into the designated area. Then click 'Upload' to process your images."
  },
  {
    question: "What file formats are supported?",
    answer: "PaveScope supports common image formats including JPG, PNG, and TIFF. For best results, use high-resolution images."
  },
  {
    question: "How long does the analysis process take?",
    answer: "Analysis time varies depending on the image size and complexity. Typically, results are available within a few minutes."
  },
  {
    question: "Can I export my analysis results?",
    answer: "Yes, you can export your results in various formats including PDF reports and CSV data files from the Results page."
  },
  {
    question: "Do I need to provide GPS data for my images?",
    answer: "It's recommended to use images with embedded GPS data. If your images don't have GPS information, you can manually enter the coordinates during the upload process."
  },
  {
    question: "How accurate is the pothole detection?",
    answer: "Our system uses advanced AI models for pothole detection. While accuracy can vary depending on image quality and conditions, we typically achieve high accuracy rates. You can adjust the confidence threshold in the Model Parameters section for more or less strict detection."
  },
  {
    question: "Can I view my analyzed images on a map?",
    answer: "Yes, after analysis, you can view your uploaded images and detected potholes on an interactive map in the Dashboard. This helps visualize the geographical distribution of road defects."
  },
  {
    question: "Is there a limit to how many images I can upload?",
    answer: "There's no strict limit on the number of images you can upload. However, very large batches may take longer to process. We recommend uploading in manageable batches for optimal performance."
  },
  {
    question: "How do I interpret the analysis results?",
    answer: "The analysis results show detected potholes and their severity. You can view these results visually on the images, on a map, and in detailed reports. The Dashboard provides an overview of your analyzed data."
  },
  {
    question: "Can I delete uploaded images?",
    answer: "Yes, you can delete uploaded images from the Upload page. However, please note that deleting an image will remove it and its associated data from the entire database."
  },
  {
    question: "What happens if I upload duplicate images?",
    answer: "The system will notify you if an image with the same name already exists in your gallery. You can choose to rename the file or skip the upload."
  },
  {
    question: "How is my data secured?",
    answer: "PaveScope uses Firebase for secure user authentication and Firebase for data storage. Your data is protected with industry-standard security measures."
  },
  {
    question: "Can I adjust the AI model settings?",
    answer: "This feature has not been added yet, but it will be available soon. In the future, you'll be able to adjust the confidence threshold and other parameters to fine-tune the detection accuracy."
  },
  {
    question: "What should I do if I encounter an error?",
    answer: "If you encounter any errors, please contact our support team via email or phone. You can also use the live chat feature available during business hours."
  },
  {
    question: "Can&apos;t find what you&apos;re looking for?",
    answer: "If you can&apos;t find the answer to your question, please contact our support team via email or phone. You can also use the live chat feature available during business hours."
  },
  {
    question: "How does PaveScope calculate the volume of potholes?",
    answer: "PaveScope uses a multi-step process to calculate pothole volume. First, it determines the camera height using GPS altitude data and ground elevation from Google Maps Elevation API. Then, it calculates the total image area based on the camera's field of view. For each detected pothole, it computes the fractional area relative to the total image and multiplies this by the actual area. Finally, it estimates the volume by multiplying the area by an average pothole depth of 0.2 meters."
  },
  {
    question: "What information is needed for accurate volume calculations?",
    answer: "For accurate volume calculations, PaveScope requires images with embedded GPS data (including altitude), the phone model used for capturing images (currently optimized for iPhone 14 Pro main camera at 4:3 aspect ratio), and clear, unobstructed views of the potholes."
  },
  {
    question: "How accurate are the volume calculations?",
    answer: "While our calculations provide a good estimate, accuracy can vary based on factors such as image quality, GPS accuracy, and the assumption of average pothole depth. We're continuously working to improve our algorithms for more precise measurements."
  },
  {
    question: "Why does PaveScope use the Google Maps Elevation API?",
    answer: "We use the Google Maps Elevation API to determine the ground elevation at the location where each image was taken. This allows us to calculate the actual camera height more accurately, which is crucial for determining the scale of the image and, consequently, the size of the potholes."
  },
  {
    question: "What should I do if the volume calculations seem incorrect?",
    answer: "If you believe the volume calculations are incorrect, first ensure that your images have accurate GPS data and are taken from a vertical angle. If issues persist, please contact our support team with details about the specific images and calculations in question."
  },
  {
    question: "Are there any limitations to the volume calculation feature?",
    answer: "Yes, there are some limitations. The calculations assume a flat surface and a consistent average depth for all potholes. Very large or unusually shaped potholes might not be as accurately measured. Also, the feature is currently optimized for specific phone models and camera settings."
  },
  {
    question: "How does PaveScope handle images without GPS data?",
    answer: "While PaveScope can still detect potholes in images without GPS data, accurate volume calculations require GPS information, including altitude. For images without GPS data, volume calculations will not be available."
  },
  {
    question: "Can PaveScope calculate volumes for other road defects besides potholes?",
    answer: "Currently, our volume calculation feature is optimized for potholes. We're exploring possibilities to extend this functionality to other types of road defects in future updates."
  },
  {
    question: "How does PaveScope calculate the cost of repairing potholes?",
    answer: "PaveScope calculates repair costs based on the estimated volume of each pothole and the selected repair material. After calculating the volume, users can choose a material (e.g., standard asphalt, premium asphalt) with an associated cost per cubic meter. The total cost is then calculated by multiplying the volume by the material cost."
  },
  {
    question: "What repair materials are available for cost calculations?",
    answer: "Currently, PaveScope offers two material options for cost calculations: Standard Asphalt and Premium Asphalt. Standard Asphalt is priced at $100 per cubic meter, while Premium Asphalt is $150 per cubic meter. These are example prices and may not reflect actual market rates in all areas."
  },
  {
    question: "Can I add custom materials or prices for cost calculations?",
    answer: "At the moment, users cannot add custom materials or prices. We're considering adding this feature in a future update to allow for more accurate local pricing and additional material options."
  },
  {
    question: "How accurate are the cost estimates?",
    answer: "The accuracy of cost estimates depends on several factors, including the accuracy of volume calculations and the relevance of the material prices to your specific location. These estimates should be considered as rough guidelines rather than exact quotes. For precise cost estimates, we recommend consulting with local road repair professionals."
  },
  {
    question: "Can I see a breakdown of costs for multiple potholes?",
    answer: "Yes, when you select multiple potholes for volume and cost calculation, PaveScope provides both individual and total costs. You can view this breakdown in the detailed results section and export it in the generated reports."
  },
  {
    question: "How can I use the cost calculation feature for budgeting road repairs?",
    answer: "The cost calculation feature can be a useful tool for initial budgeting and prioritization of road repairs. By analyzing multiple areas, you can get an estimate of total repair costs and identify which areas might require the most significant investment. However, for final budgeting decisions, we recommend combining these estimates with on-site assessments and local contractor quotes."
  },
  {
    question: "Does the cost calculation include labor and equipment costs?",
    answer: "No, the current cost calculation only includes the material costs based on the estimated volume of the potholes. Labor, equipment, and other associated repair costs are not included in these estimates. These additional costs can vary significantly based on location, project scale, and other factors."
  },
  {
    question: "Can I export the cost calculation data?",
    answer: "Yes, you can export the cost calculation data along with volume estimates and other detection information. This data is included in the CSV exports from the Spreadsheets page and in the detailed PDF reports generated by PaveScope."
  }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6 bg-blue-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Help Center</h1>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <p className="text-gray-600">
              Find answers to common questions and get support for using PaveScope.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-800">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFaqs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-blue-700 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No matching questions found. Try a different search term.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-800">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700">support@pavescope.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700">Live chat available 9AM-5PM EST</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
