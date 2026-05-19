# ByteZone Branch Merge Order

## Important Reminder

Do not merge these branches into `main` yet unless the group gives the final go signal.

This project used stacked feature branches, meaning each new branch was created from the previous working branch. Because of that, branches should be merged in order.

## Recommended Merge Order

1. `feature/web-backend-role-routing`
2. `feature/payment-sandbox`
3. `feature/admin-orders-management`
4. `feature/notifications`
5. `feature/admin-dashboard-metrics`
6. `feature/admin-user-management`
7. `feature/admin-reservations-management`
8. `feature/session-extend-playtime`
9. `feature/admin-snacks-management`
10. `feature/announcements-management`
11. `feature/transaction-history`
12. `feature/reservation-notifications`
13. `feature/user-current-session`
14. `feature/user-pending-payment-checkout`
15. `feature/admin-pending-payment-actions`
16. `feature/admin-station-management`
17. `feature/ui-navigation-cleanup`
18. `docs/final-setup-and-testing-notes`

## Before Merging Each Branch

Run:

```bash
git status