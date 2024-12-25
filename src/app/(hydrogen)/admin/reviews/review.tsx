'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SpinnerLoader } from '@/components/ui/spinner';
import { fetchUtil } from '@/utils/fetch';
import toast from 'react-hot-toast';

export const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const data = await fetchUtil('/api/reviews'); // Replace with your actual API endpoint
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateReviewStatus = async (reviewId, status) => {
    try {
      await fetchUtil(`/api/reviews/${reviewId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      toast.success('Review status updated successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await fetchUtil(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return <SpinnerLoader />;
  }

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <h4 className="mb-6 text-xl font-bold">Customer Reviews</h4>

      <ul className="space-y-4">
        {dummy.map((review) => (
          <li
            key={review.reviewId}
            className="flex items-start justify-between rounded-md bg-gray-100 p-4 shadow-sm"
          >
            <div>
              <p className="font-bold">{review.customerName}</p>
              <p className="text-sm">Product: {review.productName}</p>
              <p className="text-sm">Rating: {review.rating}/5</p>
              <p className="text-sm">Comment: {review.comment}</p>
              <p className="text-xs text-gray-500">
                Submitted on: {new Date(review.createdOn).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => deleteReview(review.reviewId)}
                color="danger"
                variant='outline'
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const dummy = [
  {
    reviewId: 'r1',
    productId: 'p1',
    productName: 'Smart Watch X200',
    customerId: 'c1',
    customerName: 'John Doe',
    rating: 5,
    comment:
      'Amazing product! Battery life is excellent and it has all the features I need.',
    createdOn: '2024-08-01T12:30:00.000Z',
    status: 'Pending',
  },
  {
    reviewId: 'r2',
    productId: 'p2',
    productName: 'Wireless Earbuds Pro',
    customerId: 'c2',
    customerName: 'Jane Smith',
    rating: 4,
    comment: 'Great sound quality, but the case is a bit bulky.',
    createdOn: '2024-08-03T08:45:00.000Z',
    status: 'Approved',
  },
  {
    reviewId: 'r3',
    productId: 'p3',
    productName: '4K Action Camera',
    customerId: 'c3',
    customerName: 'Michael Johnson',
    rating: 3,
    comment: 'Good camera, but the video stabilization could be better.',
    createdOn: '2024-08-05T14:20:00.000Z',
    status: 'Rejected',
  },
  {
    reviewId: 'r4',
    productId: 'p1',
    productName: 'Smart Watch X200',
    customerId: 'c4',
    customerName: 'Alice Brown',
    rating: 5,
    comment: 'Absolutely love this watch! It’s stylish and very functional.',
    createdOn: '2024-08-07T09:15:00.000Z',
    status: 'Approved',
  },
  {
    reviewId: 'r5',
    productId: 'p4',
    productName: 'Fitness Tracker V2',
    customerId: 'c5',
    customerName: 'David Wilson',
    rating: 2,
    comment:
      'Not very accurate in tracking steps. Disappointed with the performance.',
    createdOn: '2024-08-09T16:05:00.000Z',
    status: 'Pending',
  },
];
