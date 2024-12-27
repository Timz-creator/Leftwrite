import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Feather, Zap, Settings } from 'lucide-react';
export function Popup() {
    return (React.createElement("div", { className: "w-[300px] p-4 bg-background text-foreground" },
        React.createElement("header", { className: "flex items-center justify-between mb-4" },
            React.createElement("div", { className: "flex items-center" },
                React.createElement(BrainCircuit, { className: "h-6 w-6 mr-2 text-primary" }),
                React.createElement("h1", { className: "text-lg font-bold" }, "AI Writer Assistant")),
            React.createElement(Button, { variant: "ghost", size: "icon" },
                React.createElement(Settings, { className: "h-4 w-4" }))),
        React.createElement(Tabs, { defaultValue: "write", className: "w-full" },
            React.createElement(TabsList, { className: "grid w-full grid-cols-2" },
                React.createElement(TabsTrigger, { value: "write" }, "Write"),
                React.createElement(TabsTrigger, { value: "research" }, "Research")),
            React.createElement(TabsContent, { value: "write", className: "space-y-4" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { htmlFor: "write-input", className: "text-sm font-medium" }, "What would you like to write about?"),
                    React.createElement(Input, { id: "write-input", placeholder: "Enter your topic or idea..." })),
                React.createElement(Button, { className: "w-full" },
                    React.createElement(Feather, { className: "mr-2 h-4 w-4" }),
                    " Start Writing")),
            React.createElement(TabsContent, { value: "research", className: "space-y-4" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { htmlFor: "research-input", className: "text-sm font-medium" }, "What topic would you like to research?"),
                    React.createElement(Input, { id: "research-input", placeholder: "Enter your research topic..." })),
                React.createElement(Button, { className: "w-full" },
                    React.createElement(Zap, { className: "mr-2 h-4 w-4" }),
                    " Find Information"))),
        React.createElement("div", { className: "mt-4 pt-4 border-t border-border" },
            React.createElement("p", { className: "text-xs text-muted-foreground text-center" }, "AI Writer Assistant v1.0.0"))));
}
