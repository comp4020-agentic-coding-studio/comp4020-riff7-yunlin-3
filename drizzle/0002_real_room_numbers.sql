-- The seeded rooms were placeholders ("Group Room 1"…); these are the real
-- group study rooms they now stand for, taken from ANU Library's published
-- floor plans (Hancock, Feb 2021; Chifley, Mar 2021). Renames in place so
-- any bookings already on the deployed volume stay attached to their room.
UPDATE `rooms` SET `name` = 'Hancock — Group Study 3.33' WHERE `name` = 'Hancock — Group Room 1';
--> statement-breakpoint
UPDATE `rooms` SET `name` = 'Hancock — Group Study 3.34' WHERE `name` = 'Hancock — Group Room 2';
--> statement-breakpoint
UPDATE `rooms` SET `name` = 'Chifley — Group Study 3.05' WHERE `name` = 'Chifley — Group Room 3';
