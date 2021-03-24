const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message("hello", async ({ message, say }) => {
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

app.event("app_mention", async ({ event, say }) => {
  const reversedText = [...event.text].reverse().join("");
  await say(reversedText);
});

app.command('/ticket', async ({ ack, body, client }) => {
  // コマンドのリクエストを確認
  await ack();

  try {
    const result = await client.views.open({
      // 適切な trigger_id を受け取ってから 3 秒以内に渡す
      trigger_id: body.trigger_id,
      // view の値をペイロードに含む
      view: {
        type: 'modal',
        // callback_id が view を特定するための識別子
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Welcome to a modal with _blocks_'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.action('button_abc', async ({ ack, body, client }) => {
  // ボタンを押したイベントを確認
  await ack();

  try {
    const result = await client.views.update({
      // リクエストに含まれる view_id を渡す
      view_id: body.view.id,
      // 競合状態を防ぐために更新前の view に含まれる hash を指定
      hash: body.view.hash,
      // 更新された view の値をペイロードに含む
      view: {
        type: 'modal',
        // callback_id が view を特定するための識別子
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});

app.view('view_1', async ({ ack, body, view, client }) => {
  // モーダルでのデータ送信イベントを確認
  await ack();

  const val = view['state']['values']['input_c']['dreamy_input'];
  const user = body['user']['id'];

  const msg = val;

  // ユーザーにメッセージを送信
  try {
    await client.chat.postMessage({
      channel: view.response_urls.channel_id,
      text: msg
    });
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
