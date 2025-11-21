# 📝 TODO - Current Tasks & Roadmap

**Last Updated:** November 18, 2024

---

## 🔥 Immediate Tasks (This Week)

### Testing & Validation
- [ ] **Test complete user flow**
  - Register new account
  - Check in at study spot
  - Send study request
  - Accept/decline request
  - View inbox tabs
  - Test notification badges

- [ ] **Mobile responsiveness testing**
  - Test on iPhone/Android
  - Check all pages render correctly
  - Test touch interactions
  - Verify font sizes are readable

- [ ] **Browser compatibility**
  - Test on Chrome, Safari, Firefox
  - Check for console errors
  - Verify all features work

### Bug Fixes
- [ ] **Fix any linting errors** (if found during testing)
- [ ] **Check for broken links** in navigation
- [ ] **Verify all modals close properly**

---

## 📚 Documentation (In Progress)

### Completed
- [x] README.md - Setup and overview
- [x] ARCHITECTURE.md - System design
- [x] FEATURES.md - Feature specs and status
- [x] TODO.md - This file

### Remaining
- [ ] **Archive old docs** to `docs/archive/`
  - Move 20+ old doc files
  - Keep only essential reference docs
  - Update references if needed

- [ ] **Update DEPLOYMENT_GUIDE.md**
  - Verify deployment steps still work
  - Add any missing instructions
  - Test deployment process

---

## 🚀 Production Readiness (Next 1-2 Weeks)

### Pre-Deployment Checklist
- [ ] **Environment setup**
  - [ ] Create production Firebase project (if needed)
  - [ ] Configure Vercel production environment
  - [ ] Set up custom domain (optional)

- [ ] **Security audit**
  - [ ] Review Firestore security rules
  - [ ] Test unauthorized access attempts
  - [ ] Verify sensitive data protection
  - [ ] Check for exposed API keys

- [ ] **Performance optimization**
  - [ ] Run Lighthouse audit
  - [ ] Optimize images (if any added)
  - [ ] Check bundle size
  - [ ] Test load times

- [ ] **Data validation**
  - [ ] Seed production study spots
  - [ ] Test with real user data
  - [ ] Verify index creation

### Deployment Steps
- [ ] **Deploy to Vercel staging**
  ```bash
  vercel
  ```

- [ ] **Test staging environment**
  - [ ] Full user flow test
  - [ ] Mobile testing
  - [ ] Share with beta testers

- [ ] **Deploy Firestore rules & indexes**
  ```bash
  firebase deploy --only firestore:rules
  firebase deploy --only firestore:indexes
  ```

- [ ] **Deploy to production**
  ```bash
  vercel --prod
  ```

- [ ] **Monitor for errors**
  - [ ] Check Vercel logs
  - [ ] Monitor Firebase console
  - [ ] Watch for user reports

---

## ✨ Feature Enhancements (Next Month)

### High Priority
- [ ] **Push Notifications**
  - [ ] Set up Firebase Cloud Messaging
  - [ ] Create Cloud Function for notifications
  - [ ] Add notification preferences to user settings
  - [ ] Test notification delivery
  - **Impact:** High - Users miss requests without notifications
  - **Effort:** Medium - Requires Cloud Functions setup

- [ ] **Server-side check-in cleanup**
  - [ ] Create Cloud Function to expire old check-ins
  - [ ] Run every hour or on schedule
  - [ ] Update `isActive` flag in database
  - **Impact:** Medium - Currently relies on client-side
  - **Effort:** Low - Simple Cloud Function

- [ ] **Study statistics dashboard**
  - [ ] Total study hours
  - [ ] Most visited spots
  - [ ] Study streaks
  - [ ] Display on account page
  - **Impact:** Medium - Nice to have, motivational
  - **Effort:** Medium - Requires data aggregation

### Medium Priority
- [ ] **Improve map view**
  - [ ] Show real-time check-in counts on map markers
  - [ ] Add click to check in from map
  - [ ] Better mobile map experience
  - **Impact:** Medium - Map is underutilized
  - **Effort:** Medium - UI/UX improvements

- [ ] **Request management**
  - [ ] Auto-expire requests after 24 hours
  - [ ] Delete old accepted/declined requests
  - [ ] Request templates (quick messages)
  - **Impact:** Low - Nice to have
  - **Effort:** Low - Simple updates

- [ ] **Profile improvements**
  - [ ] Add bio/description field
  - [ ] Major/year information
  - [ ] Study preferences
  - **Impact:** Low - Social features
  - **Effort:** Low - Simple fields

### Low Priority
- [ ] **Comments on check-in posts**
  - [ ] Add comment functionality
  - [ ] Display comment count
  - [ ] Notification for new comments
  - **Impact:** Low - Not core feature
  - **Effort:** High - New database structure

- [ ] **Photo uploads**
  - [ ] Profile pictures
  - [ ] Study spot photos
  - [ ] Requires Firebase Storage
  - **Impact:** Low - Nice to have
  - **Effort:** High - Storage + UI

---

## 🐛 Known Issues

### To Fix
- [ ] **Long usernames overflow** in some layouts
  - **Where:** StudySpotCard roster, CheckInPost
  - **Fix:** Add text truncation or overflow handling
  - **Priority:** Low

- [ ] **No duplicate check-in prevention**
  - **Issue:** User can check in at same spot twice
  - **Fix:** Query for existing active check-in before creating
  - **Priority:** Medium

- [ ] **Toast notifications overlap** if multiple fired quickly
  - **Issue:** Multiple toasts stack on top of each other
  - **Fix:** Queue system or dismiss previous toast
  - **Priority:** Low

### To Investigate
- [ ] **Check-in expiration edge cases**
  - What happens if user closes browser during check-in?
  - Does client-side expiration work reliably?

- [ ] **Friend system scalability**
  - Friends array might not scale to 1000+ friends
  - Consider separate friends collection if needed

---

## 🧪 Testing Roadmap

### Manual Testing (Current)
- [x] Basic user flows
- [ ] Edge cases
- [ ] Error handling
- [ ] Mobile devices
- [ ] Multiple browsers

### Automated Testing (Future)
- [ ] **Unit tests**
  - [ ] Utility functions (userCache, validation)
  - [ ] Component logic
  - [ ] Type checking

- [ ] **Integration tests**
  - [ ] Firebase integration
  - [ ] API calls
  - [ ] Real-time listeners

- [ ] **E2E tests**
  - [ ] Critical user flows
  - [ ] Check-in → Request → Accept flow
  - [ ] Registration → Profile setup
  - **Tool:** Cypress or Playwright

---

## 📊 Analytics & Monitoring

### To Implement
- [ ] **Google Analytics 4**
  - [ ] Set up GA4 property
  - [ ] Add tracking code
  - [ ] Define key events
  - [ ] Create dashboards

- [ ] **Error tracking**
  - [ ] Set up Sentry or similar
  - [ ] Track JavaScript errors
  - [ ] Monitor API failures
  - [ ] Alert on critical errors

- [ ] **Performance monitoring**
  - [ ] Track page load times
  - [ ] Monitor Firestore query performance
  - [ ] Alert on slow queries

### Key Metrics to Track
- Daily/Monthly active users
- Check-ins per user per day
- Study requests sent vs accepted rate
- Average session duration
- Most popular study spots
- Peak usage times (for capacity planning)

---

## 🎨 Design Improvements

### UI Polish
- [ ] **Loading states**
  - [ ] Better skeleton screens
  - [ ] Consistent spinner usage
  - [ ] Loading text improvements

- [ ] **Empty states**
  - [ ] Better empty inbox message
  - [ ] Empty feed suggestions
  - [ ] Empty roster encouragement

- [ ] **Toast styling**
  - [ ] Match Cody design system
  - [ ] Add icons
  - [ ] Better positioning on mobile

### Responsive Design
- [ ] **Mobile optimization**
  - [ ] Larger touch targets
  - [ ] Better spacing on small screens
  - [ ] Collapsible sections

- [ ] **Tablet optimization**
  - [ ] Better use of medium screen space
  - [ ] Adjust grid layouts

---

## 📱 Mobile App (Future)

### React Native Version
- [ ] Evaluate need for native app
- [ ] Prototype with React Native
- [ ] iOS App Store submission
- [ ] Android Play Store submission
- **Timeline:** 6+ months out
- **Priority:** Low (PWA sufficient for now)

---

## 🔄 Refactoring Tasks

### Code Quality
- [ ] **Extract shared hooks**
  - [ ] useAuth hook
  - [ ] useFirestore hook
  - [ ] useRealtime hook

- [ ] **Component optimization**
  - [ ] Memoize expensive calculations
  - [ ] Use React.memo where appropriate
  - [ ] Reduce prop drilling

- [ ] **Type improvements**
  - [ ] Remove 'any' types
  - [ ] Add stricter type checking
  - [ ] Better TypeScript coverage

### File Organization
- [ ] **Move utilities to shared folder**
  - [ ] userCache.ts → src/lib/
  - [ ] Create hooks folder
  - [ ] Create constants folder

- [ ] **Consolidate styles**
  - [ ] Extract CSS variables to single file
  - [ ] Remove duplicate styles
  - [ ] Consider CSS-in-JS or Tailwind

---

## 🎓 Learning & Documentation

### Developer Onboarding
- [ ] **Create onboarding guide**
  - [ ] How to set up locally
  - [ ] How to contribute
  - [ ] Code style guidelines
  - [ ] Git workflow

- [ ] **Component documentation**
  - [ ] Add JSDoc comments
  - [ ] Create Storybook (optional)
  - [ ] Document props

### Team Resources
- [ ] **Knowledge base**
  - [ ] Common issues & solutions
  - [ ] Deployment runbook
  - [ ] Troubleshooting guide

---

## 💡 Ideas for Future

### Brainstorm (No commitment)
- Study groups/clubs feature
- Integration with Canvas/Calnet
- Study resource sharing (notes, flashcards)
- Study playlists (Spotify integration)
- Pomodoro timer integration
- Study challenge/competitions
- Alumni mentorship matching
- Virtual study rooms (Zoom integration)

---

## 📅 Timeline Summary

### This Week
- Testing & bug fixes
- Documentation cleanup
- Prepare for deployment

### Next 2 Weeks
- Deploy to production
- Monitor for issues
- Gather user feedback

### Next Month
- Push notifications
- Server-side cleanup
- Study statistics
- Map improvements

### Next Quarter
- Advanced features
- Mobile optimization
- Analytics implementation
- Performance improvements

---

**For urgent issues or questions, contact the maintainer.**


