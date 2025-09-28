'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  matchedDrugs?: any[]
}

interface ScoobyAIProps {
  onSendMessage: (message: string) => Promise<{
    answer: string
    sources?: string[]
    matchedDrugs?: any[]
  }>
  isLoading?: boolean
  onSaveDrug?: (drugId: string) => void
  savedDrugIds?: Set<string>
  showSources?: boolean
}

export default function ScoobyAI({ onSendMessage, isLoading, onSaveDrug, savedDrugIds, showSources = false }: ScoobyAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I am ScoobyAI. Ask me anything you\'d like to know!',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [latestMatchedDrugs, setLatestMatchedDrugs] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSend = async () => {
    const message = inputValue.trim()
    if (!message || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await onSendMessage(message)
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
        matchedDrugs: response.matchedDrugs
      }

      setMessages(prev => [...prev, assistantMessage])
      setLatestMatchedDrugs(response.matchedDrugs || [])
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }


  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-[#4376EC] text-white p-5 flex items-center gap-3 min-h-[80px]">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9V7.5L3 7V9C3 10.09 3.29 11.12 3.8 12L5.5 12C5.19 11.37 5 10.7 5 10H7V14C7 15.1 7.9 16 9 16V22H11V16C12.1 16 13 15.1 13 14V10H15C15 10.7 14.81 11.37 14.5 12L16.2 12C16.71 11.12 17 10.09 17 9H19C19 14 16.39 18.39 12.66 20.16L13.66 21.58C18.78 19.55 22 15.54 22 11C22 10.76 21.97 10.53 21.94 10.3L21 9Z"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight">ScoobyAI</h1>
        </div>

        {/* Conversation Area */}
        <div className="bg-[#F8F9FA] min-h-[360px] h-[460px] xl:h-[560px] overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-3xl px-4 py-3 shadow-sm ${
                  message.type === 'user'
                    ? 'bg-[#4376EC] text-white ml-8'
                    : 'bg-white text-gray-800 mr-8'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="text-[#4376EC] text-xs font-semibold uppercase tracking-wider mb-2">
                    AI Assistant
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">
                    You
                  </div>
                )}
                <div className="text-sm leading-relaxed">
                  {message.content}
                </div>
                {showSources && message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 font-medium mb-1">Sources:</div>
                    <div className="text-xs text-gray-500">
                      {message.sources.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {(isTyping || isLoading) && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-3xl px-4 py-3 shadow-sm mr-8 max-w-3xl">
                <div className="text-[#4376EC] text-xs font-semibold uppercase tracking-wider mb-2">
                  AI Assistant
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message…"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-full text-sm outline-none focus:border-[#4376EC] focus:ring-3 focus:ring-[#4376EC]/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
              aria-label="Message input"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-11 h-11 bg-[#4376EC] text-white rounded-lg flex items-center justify-center hover:bg-[#3366D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 group"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
        </div>
        </div>
      </div>
      
      {/* Matched Drugs Section */}
      {latestMatchedDrugs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#4376EC] rounded-full"></div>
            Related Drugs Found
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latestMatchedDrugs.map((drug) => (
              <div key={drug.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{drug.name}</h4>
                    {drug.genericName && (
                      <p className="text-xs text-gray-600 mt-1">Generic: {drug.genericName}</p>
                    )}
                  </div>
                  {onSaveDrug && savedDrugIds && (
                    <button
                      onClick={() => !savedDrugIds.has(drug.id) && onSaveDrug(drug.id)}
                      disabled={savedDrugIds.has(drug.id)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        savedDrugIds.has(drug.id)
                          ? 'bg-green-100 text-green-800 cursor-default'
                          : 'bg-[#4376EC] text-white hover:bg-[#3366D6]'
                      }`}
                    >
                      {savedDrugIds.has(drug.id) ? '✓ Saved' : 'Save'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Manufacturer:</strong> {drug.manufacturer}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Active:</strong> {drug.activeIngredient}
                </p>
                {drug.species && drug.species.length > 0 && (
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Species:</strong> {drug.species.join(', ')}
                  </p>
                )}
                {drug.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {drug.description.length > 100 
                      ? `${drug.description.substring(0, 100)}...` 
                      : drug.description
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
