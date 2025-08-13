import { CheckIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FormStep } from "@/hooks/useProductForm";

interface StepIndicatorProps {
  currentStep: FormStep;
  steps: Array<{
    id: FormStep;
    title: string;
    description: string;
    isCompleted: boolean;
  }>;
  onStepClick: (step: FormStep) => void;
  progress: number;
}

export function StepIndicator({ 
  currentStep, 
  steps, 
  onStepClick, 
  progress 
}: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Form Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.isCompleted;
          const isClickable = isCompleted || index === 0;

          return (
            <Button
              key={step.id}
              variant={isActive ? "default" : "outline"}
              className={`h-auto p-4 flex flex-col items-center space-y-2 text-left ${
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
            >
              <div className="flex items-center space-x-2 w-full">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : isCompleted 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 