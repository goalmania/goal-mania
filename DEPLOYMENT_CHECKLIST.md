# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

- [ ] `NEXT_PUBLIC_SITE_URL` = `https://your-domain.vercel.app`
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `CLOUDINARY_CLOUD_NAME` = Your cloud name
- [ ] `CLOUDINARY_API_KEY` = Your API key
- [ ] `CLOUDINARY_API_SECRET` = Your API secret
- [ ] `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` = Your upload preset
- [ ] `NEXTAUTH_SECRET` = Your secret key
- [ ] `NEXTAUTH_URL` = `https://your-domain.vercel.app`
- [ ] `STRIPE_SECRET_KEY` = Your Stripe key (if using)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` = Your Stripe public key (if using)

**Important:** Set these for all environments (Production, Preview, Development)

### 2. Database Verification
- [ ] Verify MongoDB connection works
- [ ] Ensure products have `isActive: true` in database
- [ ] Confirm mystery box products have `isMysteryBox: true`
- [ ] Check that video products have populated `videos` array

### 3. Cloudinary Setup
- [ ] Login to Cloudinary dashboard
- [ ] Verify upload preset exists
- [ ] Ensure preset allows unsigned uploads
- [ ] Check folders exist: `goal-mania/videos`, `goal-mania/video-thumbnails`

## 📦 Deployment Steps

### Step 1: Commit & Push Changes
```bash
git add .
git commit -m "Fix: Direct database queries for production build"
git push origin main
```

### Step 2: Monitor Deployment
- [ ] Open Vercel dashboard
- [ ] Watch deployment progress
- [ ] Check for any build errors
- [ ] Review deployment logs

### Step 3: Verify Production Site
After deployment completes, check these pages:

#### Homepage (`/`)
- [ ] Hero section loads
- [ ] Latest Products section shows products
- [ ] Featured Products display correctly
- [ ] Video section appears (if products with videos exist)

#### Shop Page (`/shop`)
- [ ] Best Selling Products section populated
- [ ] Latest Products section populated
- [ ] Mystery Box section shows boxes
- [ ] Video products section (if applicable)

#### Mystery Box Page (`/shop/mystery-box`)
- [ ] Mystery box products display
- [ ] Size selection works
- [ ] Exclusion form functional

#### Admin Panel (`/admin`)
- [ ] Login works
- [ ] Products page loads
- [ ] Video upload functionality works
- [ ] Image upload to Cloudinary works

## 🔍 Post-Deployment Testing

### Functional Tests
- [ ] Add product to cart
- [ ] Wishlist functionality
- [ ] Search products
- [ ] Filter by category
- [ ] Sort products

### Admin Tests
- [ ] Upload video through admin panel
- [ ] Upload product images
- [ ] Create new product
- [ ] Edit existing product
- [ ] Toggle product active/inactive

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] No console errors in browser
- [ ] Images load properly
- [ ] Videos play correctly

## 🐛 Troubleshooting

If products don't show:
1. [ ] Check Vercel logs: `Functions` tab in dashboard
2. [ ] Verify MongoDB connection in logs
3. [ ] Check database for products with `isActive: true`
4. [ ] Verify environment variables are set correctly

If videos don't upload:
1. [ ] Check Cloudinary API credentials
2. [ ] Verify upload preset configuration
3. [ ] Check browser console for errors
4. [ ] Review Vercel function logs

If mystery boxes missing:
1. [ ] Check database for `isMysteryBox: true` products
2. [ ] Verify MongoDB query in logs
3. [ ] Check product active status

## 📊 Performance Monitoring

After 24 hours, check:
- [ ] Vercel Analytics dashboard
- [ ] Error rates (should be < 1%)
- [ ] Average page load time
- [ ] API response times
- [ ] Database query performance in MongoDB Atlas

## ✅ Success Criteria

Your deployment is successful when:
- ✅ All product sections display correctly
- ✅ Mystery boxes show on shop page
- ✅ Videos upload successfully
- ✅ No errors in Vercel logs
- ✅ Page load times are acceptable
- ✅ All features work as in local development

## 🔄 If Rollback Needed

If critical issues occur:
```bash
# Option 1: Rollback in Vercel Dashboard
# Go to Deployments → Click "..." on previous deployment → "Promote to Production"

# Option 2: Git rollback
git revert HEAD
git push origin main
```

## 📝 Notes

- Changes use direct database queries (more reliable for production builds)
- ISR revalidation set to 300 seconds (5 minutes)
- All queries include error handling
- Empty arrays returned on error (graceful degradation)

## 🎯 Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**MongoDB Atlas:** https://cloud.mongodb.com
**Cloudinary:** https://cloudinary.com/console

---

**Status:** [ ] Not Started | [ ] In Progress | [ ] Completed
**Deployed By:** _________________
**Date:** _________________
**Production URL:** _________________
