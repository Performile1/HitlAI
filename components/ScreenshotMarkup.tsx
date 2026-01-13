'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Arrow } from 'react-konva';
import { Pencil, Square, Circle as CircleIcon, Type, ArrowRight, Eraser, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScreenshotMarkupProps {
  imageUrl: string;
  onSave: (markupData: any, imageDataUrl: string) => void;
  onClose: () => void;
}

type Tool = 'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser';

interface DrawingElement {
  type: 'line' | 'rect' | 'circle' | 'arrow' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
}

export default function ScreenshotMarkup({ imageUrl, onSave, onClose }: ScreenshotMarkupProps) {
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    if (tool === 'pen') {
      setElements([...elements, {
        type: 'line',
        points: [pos.x, pos.y],
        color,
        strokeWidth
      }]);
    } else if (tool === 'rectangle') {
      setElements([...elements, {
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        strokeWidth
      }]);
    } else if (tool === 'circle') {
      setElements([...elements, {
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        color,
        strokeWidth
      }]);
    } else if (tool === 'arrow') {
      setElements([...elements, {
        type: 'arrow',
        points: [pos.x, pos.y, pos.x, pos.y],
        color,
        strokeWidth
      }]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    const lastElement = elements[elements.length - 1];

    if (tool === 'pen' && lastElement.type === 'line') {
      const newPoints = lastElement.points!.concat([pos.x, pos.y]);
      const updatedElements = [...elements];
      updatedElements[updatedElements.length - 1] = {
        ...lastElement,
        points: newPoints
      };
      setElements(updatedElements);
    } else if (tool === 'rectangle' && lastElement.type === 'rect') {
      const updatedElements = [...elements];
      updatedElements[updatedElements.length - 1] = {
        ...lastElement,
        width: pos.x - lastElement.x!,
        height: pos.y - lastElement.y!
      };
      setElements(updatedElements);
    } else if (tool === 'circle' && lastElement.type === 'circle') {
      const dx = pos.x - lastElement.x!;
      const dy = pos.y - lastElement.y!;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const updatedElements = [...elements];
      updatedElements[updatedElements.length - 1] = {
        ...lastElement,
        radius
      };
      setElements(updatedElements);
    } else if (tool === 'arrow' && lastElement.type === 'arrow') {
      const updatedElements = [...elements];
      const points = lastElement.points!;
      updatedElements[updatedElements.length - 1] = {
        ...lastElement,
        points: [points[0], points[1], pos.x, pos.y]
      };
      setElements(updatedElements);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (!stageRef.current) return;

    const dataUrl = stageRef.current.toDataURL();
    onSave(elements, dataUrl);
  };

  const handleClear = () => {
    setElements([]);
  };

  const handleUndo = () => {
    setElements(elements.slice(0, -1));
  };

  const tools = [
    { id: 'pen' as Tool, icon: Pencil, label: 'Pen' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: CircleIcon, label: 'Circle' },
    { id: 'arrow' as Tool, icon: ArrowRight, label: 'Arrow' },
    { id: 'text' as Tool, icon: Type, label: 'Text' },
    { id: 'eraser' as Tool, icon: Eraser, label: 'Eraser' }
  ];

  const colors = [
    { value: '#ef4444', label: 'Red' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#000000', label: 'Black' },
    { value: '#ffffff', label: 'White' }
  ];

  if (!image) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-white">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Tools */}
            <div className="flex gap-2">
              {tools.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      tool === t.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title={t.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Colors */}
            <div className="flex gap-2 ml-4">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    color === c.value
                      ? 'border-white scale-110'
                      : 'border-slate-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-slate-400">Size:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-white w-6">{strokeWidth}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleUndo} variant="outline" size="sm">
              Undo
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              Clear
            </Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center">
        <Stage
          ref={stageRef}
          width={image.width}
          height={image.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="border border-slate-700"
        >
          <Layer>
            {/* Background Image */}
            <Rect
              x={0}
              y={0}
              width={image.width}
              height={image.height}
              fillPatternImage={image}
            />

            {/* Drawing Elements */}
            {elements.map((element, i) => {
              if (element.type === 'line') {
                return (
                  <Line
                    key={i}
                    points={element.points}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                  />
                );
              } else if (element.type === 'rect') {
                return (
                  <Rect
                    key={i}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                  />
                );
              } else if (element.type === 'circle') {
                return (
                  <Circle
                    key={i}
                    x={element.x}
                    y={element.y}
                    radius={element.radius}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                  />
                );
              } else if (element.type === 'arrow') {
                return (
                  <Arrow
                    key={i}
                    points={element.points}
                    stroke={element.color}
                    strokeWidth={element.strokeWidth}
                    fill={element.color}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
