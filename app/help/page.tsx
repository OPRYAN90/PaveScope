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

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-blue-800">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="mb-4">
                    <h3 className="font-semibold text-blue-700 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))
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
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="space-y-3">
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
      </div>
    </DashboardLayout>
  )
}