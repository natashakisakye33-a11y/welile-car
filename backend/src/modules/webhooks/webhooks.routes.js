const express = require('express');
const { Webhook } = require('svix');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// The webhook endpoint needs the raw body, so we parse it here specifically
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Get the headers
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Error occurred -- no svix headers" });
  }

  // Get the body
  const payload = req.body;
  const body = payload.toString('utf8');

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ error: "Error verifying webhook" });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  
  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name, phone_numbers } = evt.data;
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'New User';
    const phone = phone_numbers && phone_numbers.length > 0 ? phone_numbers[0].phone_number : `TEMP_${id}`;
    
    try {
      await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email,
          name: name,
          phone: phone, 
        }
      });
      console.log('User created in Prisma');
    } catch (err) {
      console.error('Error creating user in Prisma:', err);
    }
  }

  if (eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, phone_numbers } = evt.data;
    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null;
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Updated User';
    const phone = phone_numbers && phone_numbers.length > 0 ? phone_numbers[0].phone_number : undefined;

    try {
      await prisma.user.update({
        where: { clerkUserId: id },
        data: {
          email: email,
          name: name,
          ...(phone ? { phone } : {})
        }
      });
      console.log('User updated in Prisma');
    } catch (err) {
      console.error('Error updating user in Prisma:', err);
    }
  }
  
  if (eventType === 'user.deleted') {
    try {
      await prisma.user.delete({
        where: { clerkUserId: id }
      });
      console.log('User deleted in Prisma');
    } catch (err) {
      console.error('Error deleting user in Prisma:', err);
    }
  }

  return res.status(200).json({ success: true });
});

module.exports = router;
