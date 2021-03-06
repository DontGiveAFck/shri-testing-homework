const GitUtil = require('../utils/git');
const git = new GitUtil();
const {
  buildFolderUrl,
  buildFileUrl,
  buildBreadcrumbs
} = require('../utils/navigation');

function buildObjectUrl(parentHash, { path, type }) {
  switch (type) {
    case 'tree':
      return buildFolderUrl(parentHash, path);
    case 'blob':
      return buildFileUrl(parentHash, path);
    default:
      return '#';
  }
}

module.exports = async function(req, res, next) {
  const { hash } = req.params;
  const pathParam = (req.params[0] || '').split('/').filter(Boolean);

  const path = pathParam.length ? pathParam.join('/') + '/' : '';

  return await git.gitFileTree(hash, path).then(
    list => {
      const files = list.map(item => ({
        ...item,
        href: buildObjectUrl(hash, item),
        name: item.path.split('/').pop()
      }));
      if (files.length) {
          res.render('files', {
              title: 'files',
              breadcrumbs: buildBreadcrumbs(hash, pathParam.join('/')),
              files
          });
      } else {
        next();
      }
    },
    err => next(err)
  );
};
