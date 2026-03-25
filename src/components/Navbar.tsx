'use client'

import { useState } from 'react'
import { Zap, Menu, X, Wallet, Globe } from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CurrentDao</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#trading" className="text-gray-600 hover:text-gray-900 transition-colors">
              Energy Trading
            </a>
            <a href="#mobile-wallets" className="text-gray-600 hover:text-gray-900 transition-colors">
              Mobile Wallets
            </a>
            <a href="#dao" className="text-gray-600 hover:text-gray-900 transition-colors">
              DAO Governance
            </a>
            <a href="/cross-border" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Cross-Border
            </a>
            <a href="#portfolio" className="text-gray-600 hover:text-gray-900 transition-colors">
              Portfolio
            </a>
            <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Documentation
            </a>
          </div>

          {/* Wallet Connect & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-4">
              <a href="#trading" className="text-gray-600 hover:text-gray-900 transition-colors">
                Energy Trading
              </a>
              <a href="#mobile-wallets" className="text-gray-600 hover:text-gray-900 transition-colors">
                Mobile Wallets
              </a>
              <a href="#dao" className="text-gray-600 hover:text-gray-900 transition-colors">
                DAO Governance
              </a>
              <a href="/cross-border" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Cross-Border
              </a>
              <a href="#portfolio" className="text-gray-600 hover:text-gray-900 transition-colors">
                Portfolio
              </a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                Documentation
              </a>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
