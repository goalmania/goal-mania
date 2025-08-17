"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";
import { IconGripVertical } from "@tabler/icons-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface ArticleImage {
  id: string;
  url: string;
  alt?: string;
  isMain?: boolean;
}

// Draggable Image Item Component
function DraggableImageItem({ 
  image, 
  onRemove, 
  onSetMain 
}: { 
  image: ArticleImage; 
  onRemove: (id: string) => void;
  onSetMain: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = useCallback(() => {
    onRemove(image.id);
  }, [image.id, onRemove]);

  const handleSetMain = useCallback(() => {
    onSetMain(image.id);
  }, [image.id, onSetMain]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white rounded-lg border-2 border-gray-200 overflow-hidden ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${image.isMain ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-gray-300'}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm rounded p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <IconGripVertical className="h-4 w-4 text-gray-600" />
      </div>

      {/* Main Image Badge */}
      {image.isMain && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Main
        </div>
      )}

      {/* Image */}
      <div className="aspect-video relative">
        <Image
          src={image.url}
          alt={image.alt || "Article image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!image.isMain && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSetMain}
              className="h-8 px-2 text-xs bg-white/90 hover:bg-white"
            >
              Set Main
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image URL Display */}
      <div className="p-2 bg-gray-50">
        <p className="text-xs text-gray-600 truncate" title={image.url}>
          {image.url}
        </p>
      </div>
    </div>
  );
}

// Draggable Image Gallery Component
export function DraggableImageGallery({ 
  images, 
  onReorder, 
  onRemove, 
  onSetMain 
}: { 
  images: ArticleImage[];
  onReorder: (images: ArticleImage[]) => void;
  onRemove: (id: string) => void;
  onSetMain: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over?.id);
      
      const newImages = arrayMove(images, oldIndex, newIndex);
      onReorder(newImages);
    }
  }, [images, onReorder]);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <PhotoIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No images uploaded yet</p>
        <p className="text-sm">Upload images to get started</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <DraggableImageItem
              key={image.id}
              image={image}
              onRemove={onRemove}
              onSetMain={onSetMain}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default DraggableImageGallery; 