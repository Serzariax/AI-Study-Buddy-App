import React, { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon, AlertCircle, Eye, FileText, Sparkles, Volume2, Copy, HelpCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AIService } from '../services/ai-service';
import { toast } from 'sonner@2.0.3';
import { exportTextAsFile, exportAnalysisAsReport } from '../utils/exportUtils';
import { updateStudentProgress } from './StudentProgress';
import { useAuth } from '../contexts/AuthContext';

interface ImageAnalyzerProps {
  onUsageUpdate?: (tokens: number) => void;
}

export function ImageAnalyzer({ onUsageUpdate }: ImageAnalyzerProps) {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'visual' | 'ocr'>('visual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
      setError(null);
      setAnalysis(null);
    };

    reader.onerror = () => {
      setError('Failed to read image file');
    };

    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setExtractedText(null);

    try {
      let analysisPrompt = prompt;
      
      // If in OCR mode, use specific OCR prompt
      if (analysisMode === 'ocr') {
        analysisPrompt = 'Extract all text from this image. Preserve formatting, structure, and layout as much as possible. Include handwritten text if present.';
      }

      const result = await AIService.analyzeImage(
        undefined,
        imageBase64,
        analysisPrompt || undefined
      );

      if (result.error) {
        setError(result.error + (result.details ? `: ${result.details}` : ''));
      } else if (result.data) {
        if (analysisMode === 'ocr') {
          setExtractedText(result.data.analysis);
          toast.success('Text extracted successfully!');
        } else {
          setAnalysis(result.data.analysis);
          toast.success('Image analyzed successfully!');
        }

        if (result.data.usage && onUsageUpdate) {
          onUsageUpdate(result.data.usage.total_tokens);
        }

        // Update student progress
        updateStudentProgress('image', user?.id);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysis(null);
    setExtractedText(null);
    setPrompt('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyText = () => {
    const textToCopy = extractedText || analysis;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard!');
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in your browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Failed to play audio');
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="flex flex-col h-full shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-orange-500" />
          Image Analyzer (Vision AI)
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Upload images to analyze content or extract text using AI vision technology!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>Analyze diagrams, extract text, or understand visual content</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!imagePreview ? (
          <div className="space-y-4">
            <div
              onClick={handleUploadClick}
              className="flex-1 min-h-[250px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <div className="p-4 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="h-12 w-12 text-orange-600" />
              </div>
              <p className="text-gray-700 mt-4 font-medium">Click to upload an image</p>
              <p className="text-sm text-gray-500 mt-2">
                Supports diagrams, notes, problems, charts, photos
              </p>
              <Badge variant="secondary" className="mt-3">
                Max 10MB • JPG, PNG, WebP
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-900 text-sm">Visual Analysis</p>
                </div>
                <p className="text-xs text-blue-700">Understand diagrams, formulas, and concepts</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <p className="font-medium text-purple-900 text-sm">Text Extraction (OCR)</p>
                </div>
                <p className="text-xs text-purple-700">Extract text from handwritten or printed notes</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-[300px] object-contain rounded-lg border-2 shadow-lg"
              />
              <Badge className="absolute top-2 right-2 bg-green-500">
                <ImageIcon className="h-3 w-3 mr-1" />
                Image loaded
              </Badge>
            </div>

            <Tabs value={analysisMode} onValueChange={(v) => setAnalysisMode(v as 'visual' | 'ocr')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visual" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Visual Analysis
                </TabsTrigger>
                <TabsTrigger value="ocr" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Extract Text (OCR)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-3 mt-4">
                <div>
                  <label className="text-sm mb-1 block font-medium">
                    Custom Analysis Prompt (optional)
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Explain the mathematical concepts shown in this diagram..."
                    rows={3}
                    disabled={isLoading}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for general analysis</p>
                </div>
              </TabsContent>

              <TabsContent value="ocr" className="mt-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    AI will extract all visible text from the image, including handwritten notes.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`flex-1 ${
                  analysisMode === 'visual' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {analysisMode === 'visual' ? 'Analyzing...' : 'Extracting...'}
                  </>
                ) : (
                  <>
                    {analysisMode === 'visual' ? (
                      <><Eye className="h-4 w-4 mr-2" />Analyze Image</>
                    ) : (
                      <><FileText className="h-4 w-4 mr-2" />Extract Text</>
                    )}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>

            {analysis && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Analysis
                  </Badge>
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => {
                            exportAnalysisAsReport(analysis, imagePreview || undefined);
                            toast.success('Analysis exported!');
                            updateStudentProgress('image', user?.id);
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Export as report</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={handleCopyText}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy to clipboard</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => handleSpeak(analysis)}>
                            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-purple-600 animate-pulse' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isSpeaking ? 'Stop' : 'Listen'}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{analysis}</p>
              </div>
            )}

            {extractedText && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-purple-500">
                    <FileText className="h-3 w-3 mr-1" />
                    Extracted Text
                  </Badge>
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => {
                            exportTextAsFile(extractedText, `extracted-text-${Date.now()}`);
                            toast.success('Text exported!');
                            updateStudentProgress('image', user?.id);
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Export as text file</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={handleCopyText}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy to clipboard</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => handleSpeak(extractedText)}>
                            <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-purple-600 animate-pulse' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{isSpeaking ? 'Stop' : 'Listen'}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="bg-white rounded p-3 font-mono text-sm">
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{extractedText}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!imagePreview && (
          <div className="text-sm text-gray-500 space-y-2">
            <p>Upload study materials like:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Handwritten notes</li>
              <li>Diagrams and charts</li>
              <li>Math problems</li>
              <li>Textbook pages</li>
              <li>Whiteboard photos</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}