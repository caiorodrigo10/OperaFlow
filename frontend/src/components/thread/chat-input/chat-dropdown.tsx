import React, { useState } from 'react'
import { ChevronDown, User, LogIn, Lock, Bot, Zap, Code, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Image from 'next/image'

const ChatDropdown = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="px-3 py-2 text-sm font-medium hover:bg-zinc-800 border border-zinc-700 text-white"
                    style={{
                        borderRadius: '12px'
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">O</span>
                        </div>
                        <span>Operabase</span>
                        <ChevronDown size={14} className="opacity-50 text-zinc-400" />
                    </div>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-64 p-0 border-0 shadow-md bg-zinc-900 text-white"
                sideOffset={4}
                style={{
                    borderRadius: '20px'
                }}
            >
                <DropdownMenuItem
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800 border-b border-zinc-700 m-0 text-white"
                    style={{
                        borderRadius: '0'
                    }}
                >
                    <User size={18} />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Operabase</span>
                        <span className="text-xs text-zinc-400">Default</span>
                    </div>
                </DropdownMenuItem>

                <div className="relative">
                    {/* Dummy agents behind the overlay */}
                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800 border-b border-zinc-700 m-0 text-white">
                        <Bot size={18} />
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Code Assistant</span>
                            <span className="text-xs text-zinc-400">Help with coding</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800 border-b border-zinc-700 m-0 text-white">
                        <Zap size={18} />
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Quick Writer</span>
                            <span className="text-xs text-zinc-400">Fast content creation</span>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800 m-0 text-white">
                        <FileText size={18} />
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">Document Helper</span>
                            <span className="text-xs text-zinc-400">Analyze documents</span>
                        </div>
                    </DropdownMenuItem>

                    {/* Overlay like the upgrade component */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent flex items-end justify-center">
                        <div className="w-full p-3">
                            <div className="rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/70 shadow-sm border border-zinc-700/50 p-3">
                                <div className="flex items-center justify-center">
                                    <Lock className="h-4 w-4 text-zinc-400 mr-2 flex-shrink-0" />
                                    <p className="text-sm font-medium text-white">Login to explore all agents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ChatDropdown