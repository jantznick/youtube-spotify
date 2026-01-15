import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// Get current user with playlists and songs
router.get('/me', async (req, res) => {
  try {
    const userId = req.session.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        playlists: {
          include: {
            playlistSongs: {
              include: {
                song: true,
              },
              orderBy: {
                position: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        songs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user email or username
router.put('/update-credentials', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { email, username } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!email && !username) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};

    // Only update email if provided and user doesn't already have one
    if (email) {
      if (currentUser.email) {
        return res.status(400).json({ error: 'Email already set. Contact support to change it.' });
      }
      
      // Check if email is already taken
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      updateData.email = email;
    }

    // Only update username if provided and user doesn't already have one
    if (username) {
      if (currentUser.username) {
        return res.status(400).json({ error: 'Username already set. Contact support to change it.' });
      }

      // Check if username is already taken
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      updateData.username = username;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Update session username if username was updated
    if (updateData.username) {
      req.session.username = updatedUser.username;
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

export default router;
