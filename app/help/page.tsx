'use client'

import React, { useState } from 'react'
import DashboardLayout from '../dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/Login/ui/card"
import { Input } from "../../components/Login/ui/input"
import { Button } from "../../components/Login/ui/button"
import { Search, Mail, Phone, MessageCircle } from 'lucide-react'

const faqs = [
  {
    question: "How do I upload images for analysis?",
    answer: "Navigate to the Upload page, click on the &apos;Choose Files&apos; button or drag and drop your images into the designated area. Then click &apos;Upload&apos; to process your images."
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
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
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