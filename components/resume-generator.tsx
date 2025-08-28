"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FileText, Download, Eye } from "lucide-react"
import toast from "react-hot-toast"

interface ResumeGeneratorProps {
  userData: {
    name: string
    email: string
    username: string
    bio: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
    skills: string[]
    projects: Array<{
      title: string
      description: string
      technologies: string[]
      liveUrl?: string
      githubUrl?: string
    }>
    experience?: Array<{
      company: string
      position: string
      duration: string
      description: string
    }>
  }
}

export function ResumeGenerator({ userData }: ResumeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const generateResumeHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${userData.name} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: white; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 2.5em; color: #2563eb; margin-bottom: 10px; }
        .header p { font-size: 1.1em; color: #666; margin: 5px 0; }
        .section { margin-bottom: 35px; }
        .section h2 { font-size: 1.4em; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 20px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill { background: #f3f4f6; padding: 6px 12px; border-radius: 16px; font-size: 0.9em; color: #374151; }
        .project { margin-bottom: 25px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .project h3 { color: #1f2937; margin-bottom: 8px; }
        .project p { color: #6b7280; margin-bottom: 10px; }
        .technologies { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tech { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
        .links { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .links a { color: #2563eb; text-decoration: none; }
        .links a:hover { text-decoration: underline; }
        @media print { body { padding: 20px; } .header h1 { font-size: 2em; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${userData.name}</h1>
        <p>${userData.bio}</p>
        ${userData.location ? `<p>📍 ${userData.location}</p>` : ''}
        <div class="links">
            <a href="mailto:${userData.email}">📧 ${userData.email}</a>
            ${userData.website ? `<a href="${userData.website}" target="_blank">🌐 Website</a>` : ''}
            ${userData.github ? `<a href="${userData.github}" target="_blank">🔗 GitHub</a>` : ''}
            ${userData.linkedin ? `<a href="${userData.linkedin}" target="_blank">💼 LinkedIn</a>` : ''}
        </div>
    </div>

    <div class="section">
        <h2>Skills & Technologies</h2>
        <div class="skills">
            ${userData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Featured Projects</h2>
        ${userData.projects.slice(0, 4).map(project => `
            <div class="project">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="technologies">
                    ${project.technologies.map(tech => `<span class="tech">${tech}</span>`).join('')}
                </div>
                ${project.liveUrl || project.githubUrl ? `
                    <div style="margin-top: 10px;">
                        ${project.liveUrl ? `<a href="${project.liveUrl}" target="_blank">🔗 Live Demo</a>` : ''}
                        ${project.liveUrl && project.githubUrl ? ' | ' : ''}
                        ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank">📁 Source Code</a>` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Contact Information</h2>
        <p>DevLink Profile: <a href="https://devlink.vercel.app/${userData.username}" target="_blank">devlink.vercel.app/${userData.username}</a></p>
        <p>Email: <a href="mailto:${userData.email}">${userData.email}</a></p>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 0.9em;">
        <p>Generated from DevLink Profile • ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // In a real implementation, you might use a service like Puppeteer or jsPDF
      // For now, we'll create an HTML version that can be printed as PDF
      const resumeHTML = generateResumeHTML()
      
      // Create blob and download
      const blob = new Blob([resumeHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${userData.name.replace(/\s+/g, '_')}_Resume.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success("Resume downloaded! Open in browser and use 'Print to PDF' for best results.")
    } catch (error) {
      toast.error("Failed to generate resume")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const openPreview = () => {
    const resumeHTML = generateResumeHTML()
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.document.write(resumeHTML)
      previewWindow.document.close()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Generator
        </CardTitle>
        <CardDescription>
          Generate a professional PDF resume from your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Your resume will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Contact information and bio</li>
            <li>Skills and technologies</li>
            <li>Featured projects with links</li>
            <li>Professional formatting</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={openPreview}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button 
            onClick={generatePDF}
            disabled={isGenerating}
            size="sm"
            className="flex-1"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Download"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p><strong>Tip:</strong> After downloading the HTML file, open it in your browser and use "Print → Save as PDF" for best results. You can customize the content by editing your profile information.</p>
        </div>
      </CardContent>
    </Card>
  )
}