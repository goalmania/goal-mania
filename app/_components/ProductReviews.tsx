"use client";

import { useState, useRef } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, XCircleIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IProduct, Review } from "@/lib/types/product";
import ReviewMediaUpload, { ReviewMediaUploadRef } from "@/components/ReviewMediaUpload";
import ReviewMediaDisplay from "@/components/ReviewMediaDisplay";

interface ProductReviewsProps {
  product: IProduct;
  reviews: Review[];
  onReviewSubmit: (review: any) => Promise<void>;
  onReviewDelete?: (reviewId: string) => Promise<void>;
}

// Creative Rating Component with hover effects
function CreativeRatingField({ 
  rating, 
  onRatingChange 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
}) {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Rating</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="relative group transition-all duration-300 transform hover:scale-110"
          >
            {/* Star background with gradient */}
            <div className="relative">

              
              {/* Star icon */}
              <StarIcon
                className={`h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300 ${
                  (hoveredRating || rating) >= star
                    ? "text-yellow-400 drop-shadow-lg filter brightness-110"
                    : "text-gray-300 hover:text-gray-400"
                } ${hoveredRating >= star ? 'animate-pulse' : ''}`}
              />
              
              {/* Glow effect on hover */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  hoveredRating >= star 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 opacity-10 blur-sm' 
                    : 'opacity-0 scale-100'
                }`}
              />
            </div>
            
            {/* Rating tooltip */}
            <div 
              className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 transition-opacity duration-200 ${
                hoveredRating === star ? 'opacity-100' : ''
              }`}
            >
              {star === 1 && 'Poor'}
              {star === 2 && 'Fair'}
              {star === 3 && 'Good'}
              {star === 4 && 'Very Good'}
              {star === 5 && 'Excellent'}
            </div>
          </button>
        ))}
      </div>
      
      {/* Rating description */}
      <div className="text-sm text-muted-foreground">
        {rating === 1 && 'Poor - Not satisfied at all'}
        {rating === 2 && 'Fair - Could be better'}
        {rating === 3 && 'Good - Satisfied'}
        {rating === 4 && 'Very Good - Highly satisfied'}
        {rating === 5 && 'Excellent - Outstanding experience'}
      </div>
    </div>
  );
}

export default function ProductReviews({ product, reviews, onReviewSubmit, onReviewDelete }: ProductReviewsProps) {
  const { data: session, status } = useSession();
  const mediaUploadRef = useRef<ReviewMediaUploadRef>(null);
  const [reviewInput, setReviewInput] = useState<{
    rating: number;
    comment: string;
    media: { images: string[]; videos: string[] };
  }>({
    rating: 5,
    comment: "",
    media: { images: [], videos: [] },
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "loading") return;

    if (!session) {
      setReviewFeedback({
        type: "error",
        message: "You must be logged in to submit a review",
      });
      setTimeout(() => {
        signIn();
      }, 1500);
      return;
    }

    setIsSubmittingReview(true);
    setReviewFeedback(null);

    try {
      await onReviewSubmit(reviewInput);
      
      // Reset form and clear media upload
      setReviewInput({ rating: 5, comment: "", media: { images: [], videos: [] } });
      mediaUploadRef.current?.clear();
      
      setReviewFeedback({
        type: "success",
        message: "Review submitted successfully!",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setReviewFeedback(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to submit review",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    setIsDeletingReview(reviewToDelete._id);
    setDeleteDialogOpen(false);

    try {
      const response = await fetch(`/api/products/${product._id}/reviews?reviewId=${reviewToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete review");
      }

      // Call the parent callback to refresh reviews
      if (onReviewDelete) {
        await onReviewDelete(reviewToDelete._id);
      }

      setReviewFeedback({
        type: "success",
        message: "Review deleted successfully!",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setReviewFeedback(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting review:", error);
      setReviewFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete review",
      });
    } finally {
      setIsDeletingReview(null);
      setReviewToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-8">
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Review summary */}
          <div className="lg:col-span-1">
            <Card className="bg-card text-card-foreground shadow-sm border border-border">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                product.averageRating > rating
                                  ? "text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-lg sm:text-2xl font-bold text-white">
                          {product.averageRating?.toFixed(1) || "0.0"}
                        </p>
                      </div>
                    </div>
                    {/* Rating badge */}
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    Customer Rating
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Based on {reviews?.length || 0} reviews
                  </p>
                  
                  {/* Rating distribution */}
                  <div className="space-y-2 mt-4">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews?.filter(r => r.rating === rating).length || 0;
                      const percentage = reviews?.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">{rating}★</span>
                          <div className="flex-1 bg-muted rounded-full h-1.5 sm:h-2">
                            <div 
                              className="bg-gradient-to-r from-brand-orange to-orange-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-6 sm:w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  {session ? (
                    <Button
                      onClick={() =>
                        document
                          .getElementById("review-form")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      variant="orange"
                      size="lg"
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Write a Review
                    </Button>
                  ) : (
                    <Button
                      onClick={() => signIn()}
                      variant="default"
                      size="lg"
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign in to Review
                    </Button>
                  )}
                  
                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Verified Reviews Only</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review list */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sm:space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <Card key={index} className="group hover:shadow-md transition-all duration-300 border-border">
                    <CardContent className="pt-6">
                      {/* Header with avatar and rating */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          {/* User avatar */}
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg shadow-sm">
                              {(review.userName || "A").charAt(0).toUpperCase()}
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-base sm:text-lg truncate">
                              {review.userName || "Anonymous"}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {[0, 1, 2, 3, 4].map((rating) => (
                                  <StarIcon
                                    key={rating}
                                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                      review.rating > rating
                                        ? "text-yellow-400"
                                        : "text-muted-foreground"
                                    } transition-colors duration-200`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Date badge and delete button */}
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <div className="px-2 py-1 sm:px-3 sm:py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {/* Delete button - only show for review owner or admin */}
                          {session && (review.userId === session.user?.id || session.user?.role === "admin") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(review)}
                              disabled={isDeletingReview === review._id}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 mt-2"
                            >
                              {isDeletingReview === review._id ? (
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Deleting...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <TrashIcon className="w-3 h-3" />
                                  <span>Delete</span>
                                </div>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Review text */}
                      <div className="relative mb-4">
                        <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-orange to-orange-600 rounded-full opacity-60"></div>
                        <blockquote className="pl-4 sm:pl-6 text-foreground leading-relaxed italic text-sm sm:text-base">
                          "{review.comment}"
                        </blockquote>
                      </div>
                      
                      {/* Display review media if available */}
                      {review.media && (review.media.images?.length > 0 || review.media.videos?.length > 0) && (
                        <div className="mt-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-muted-foreground">Customer Photos & Videos</span>
                          </div>
                          <ReviewMediaDisplay 
                            media={review.media} 
                            className="mt-2"
                          />
                        </div>
                      )}

                      {/* Review footer with verification badge */}
                      <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-green-700 dark:text-green-400">Verified Purchase</span>
                          </div>
                        </div>
                        
                        {/* Helpful button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-950/20"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-2 border-dashed border-border">
                  <CardContent className="pt-6 text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">Be the first to share your experience with this product!</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Your review will help other customers</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review form */}
              {session && (
                <Card id="review-form" className="mt-12">
                  <CardHeader>
                    <CardTitle className="text-lg">Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviewFeedback && (
                      <Alert className={`mb-4 ${
                        reviewFeedback.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                      }`}>
                        <div className="flex">
                          <div className="flex-shrink-0">
                            {reviewFeedback.type === "success" ? (
                              <CheckCircleIcon
                                className="h-5 w-5 text-green-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <XCircleIcon
                                className="h-5 w-5 text-red-400"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div className="ml-3">
                            <AlertDescription
                              className={`${
                                reviewFeedback.type === "success"
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              {reviewFeedback.message}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    )}
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                      {/* Creative Rating Field */}
                      <CreativeRatingField
                        rating={reviewInput.rating}
                        onRatingChange={(rating) =>
                          setReviewInput((prev) => ({
                            ...prev,
                            rating,
                          }))
                        }
                      />
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Comment</Label>
                        <Textarea
                          value={reviewInput.comment}
                          onChange={(e) =>
                            setReviewInput((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          rows={4}
                          placeholder="Share your experience with this product..."
                          required
                        />
                      </div>
                      
                      {/* Media Upload Section */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Add Photos & Videos (Optional)</Label>
                        <ReviewMediaUpload
                          ref={mediaUploadRef}
                          onMediaChange={(media) =>
                            setReviewInput((prev) => ({
                              ...prev,
                              media,
                            }))
                          }
                          maxFiles={5}
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Delete Review</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-foreground">
              Are you sure you want to delete your review? This will permanently remove your review and rating from this product.
            </p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeletingReview === reviewToDelete?._id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingReview === reviewToDelete?._id}
            >
              {isDeletingReview === reviewToDelete?._id ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete Review</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 