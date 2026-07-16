// PocketBase Cloud Sync Utility for Epic Toolbox

export const getPbInstance = () => {
  if (typeof window !== 'undefined' && window.PocketBase) {
    const pbUrl = localStorage.getItem('hub_pb_url') || 'http://127.0.0.1:8090';
    try {
      const pb = new window.PocketBase(pbUrl);
      if ((pb.authStore && pb.authStore.isValid) || localStorage.getItem('hub_pb_connected') === 'true') {
        return pb;
      }
    } catch (e) {
      console.warn("PocketBase initialization failed:", e);
    }
  }
  return null;
};

// Automatic Sync from local JSON to PocketBase if user adds/modifies in JSON
export const syncJsonToPocketBase = async (defaultLinks) => {
  const pb = getPbInstance();
  if (!pb) return;

  try {
    const remoteList = await pb.collection('bookmarks').getFullList();
    const remoteMap = new Map();
    remoteList.forEach(item => {
      if (item.original_id) {
        remoteMap.set(item.original_id, item);
      } else {
        remoteMap.set(`${item.title}_${item.url}`, item);
      }
    });

    for (const local of defaultLinks) {
      const localId = local.id || `${local.title}_${local.url}`;
      const remoteMatch = remoteMap.get(localId) || remoteMap.get(`${local.title}_${local.url}`);

      if (!remoteMatch) {
        // Create missing bookmark in PocketBase
        await pb.collection('bookmarks').create({
          title: local.title || 'Untitled',
          url: local.url || '',
          category: local.category || 'General',
          is_pinned: local.is_pinned || false,
          profile_id: String(local.profile_id || '1'),
          original_id: local.id || ''
        });
      } else {
        // If properties differ, update in PocketBase to match the added/modified JSON values
        const hasChanges = (local.title && remoteMatch.title !== local.title) ||
                           (local.url && remoteMatch.url !== local.url) ||
                           (local.category && remoteMatch.category !== local.category);

        if (hasChanges) {
          await pb.collection('bookmarks').update(remoteMatch.id, {
            title: local.title || remoteMatch.title,
            url: local.url || remoteMatch.url,
            category: local.category || remoteMatch.category,
            is_pinned: local.is_pinned !== undefined ? local.is_pinned : remoteMatch.is_pinned
          });
        }
      }
    }
  } catch (err) {
    console.warn("Error auto-syncing JSON modifications to PocketBase:", err);
  }
};

export const syncBookmarkToPocketBase = async (action, bookmarkOrId) => {
  const pb = getPbInstance();
  if (!pb) return;

  try {
    if (action === 'create') {
      await pb.collection('bookmarks').create({
        title: bookmarkOrId.title || 'Untitled',
        url: bookmarkOrId.url || '',
        category: bookmarkOrId.category || '',
        is_pinned: bookmarkOrId.is_pinned || false,
        profile_id: String(bookmarkOrId.profile_id || '1'),
        original_id: bookmarkOrId.id || ''
      });
    } else if (action === 'update' || action === 'pin') {
      const originalId = bookmarkOrId.id;
      const records = await pb.collection('bookmarks').getList(1, 1, {
        filter: `original_id = "${originalId}"`
      });

      if (records.items.length > 0) {
        await pb.collection('bookmarks').update(records.items[0].id, {
          title: bookmarkOrId.title,
          url: bookmarkOrId.url,
          category: bookmarkOrId.category,
          is_pinned: bookmarkOrId.is_pinned,
          profile_id: String(bookmarkOrId.profile_id || '1')
        });
      } else {
        await pb.collection('bookmarks').create({
          title: bookmarkOrId.title || 'Untitled',
          url: bookmarkOrId.url || '',
          category: bookmarkOrId.category || '',
          is_pinned: bookmarkOrId.is_pinned || false,
          profile_id: String(bookmarkOrId.profile_id || '1'),
          original_id: bookmarkOrId.id || ''
        });
      }
    } else if (action === 'delete') {
      const records = await pb.collection('bookmarks').getList(1, 1, {
        filter: `original_id = "${bookmarkOrId}"`
      });

      if (records.items.length > 0) {
        await pb.collection('bookmarks').delete(records.items[0].id);
      }
    }
  } catch (e) {
    console.warn(`Failed to sync bookmark ${action} to PocketBase:`, e);
  }
};
