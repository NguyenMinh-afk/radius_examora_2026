/**
 * Student Post Service
 */
import { Op } from 'sequelize';
import {
  ClassMember,
  ClassPost,
  User
} from '../../models/index.js';

class PostService {

  async getClassPosts(studentId, classId, filters = {}) {
    const membership = await ClassMember.findOne({
      where: { class_id: classId, user_id: studentId, role: 'student' }
    });
    if (!membership) {
      throw new Error('You are not a member of this class');
    }

    const { type, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const whereClause = { class_id: classId };
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: posts } = await ClassPost.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'author', attributes: ['full_name', 'avatar_url'] }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit,
      offset
    });

    const items = posts.map(p => ({
      postId: p.id,
      title: p.title,
      content: p.content,
      type: p.type,
      isPinned: p.is_pinned,
      attachments: p.attachments || [],
      authorName: p.author?.full_name || 'Unknown',
      authorAvatar: p.author?.avatar_url || null,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return {
      items,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }
}

export default new PostService();
